from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Document
from app.utils.dependencies import get_current_user
from app.services.upload_service import upload_service

router = APIRouter()


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    case_id: str | None = None,
    member_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a file

    - Validates file type and size
    - Uploads to local storage (or S3 when configured)
    - Creates document record in database
    - Returns file information
    """
    try:
        # Determine folder based on type
        folder = "cases" if case_id else "members"

        # Upload file
        upload_result = await upload_service.upload_file(file, folder=folder)

        # Create document record
        document = Document(
            case_id=None,  # Will be linked later when case is created
            member_id=None,  # Will be linked later when member is created
            uploaded_by_user_id=current_user.id,
            file_name=upload_result["file_name"],
            file_type=upload_result["file_type"],
            file_size=upload_result["file_size"],
            s3_key=upload_result.get("s3_key"),
            s3_url=upload_result.get("s3_url"),
            local_path=upload_result.get("local_path")
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return {
            "document_id": str(document.id),
            "file_id": upload_result["file_id"],
            "file_name": upload_result["file_name"],
            "file_size": upload_result["file_size"],
            "message": "File uploaded successfully"
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )


@router.get("/{document_id}")
async def get_document_info(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get document metadata

    Returns information about an uploaded document.
    """
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Check authorization (document owner or admin)
    if document.uploaded_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this document"
        )

    return {
        "id": str(document.id),
        "file_name": document.file_name,
        "file_type": document.file_type,
        "file_size": document.file_size,
        "uploaded_at": document.uploaded_at,
        "s3_url": document.s3_url,
        "local_path": document.local_path
    }


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a document

    Removes both database record and file from storage.
    """
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Check authorization
    if document.uploaded_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this document"
        )

    # Delete file from storage
    await upload_service.delete_file(
        s3_key=document.s3_key,
        local_path=document.local_path
    )

    # Delete database record
    db.delete(document)
    db.commit()

    return None
