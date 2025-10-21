import os
import uuid
from typing import Optional
from fastapi import UploadFile, HTTPException
from app.config import settings
from app.services.s3_service import s3_service


class UploadService:
    """
    File upload service with S3 integration
    """

    def __init__(self):
        self.use_s3 = True  # Always use S3 now that credentials are configured

        # Fallback to local storage if S3 is not available
        self.upload_dir = "uploads"
        os.makedirs(self.upload_dir, exist_ok=True)

    async def upload_file(
        self,
        file: UploadFile,
        folder: str = "general"
    ) -> dict:
        """
        Upload a file to S3

        Args:
            file: The file to upload
            folder: Folder/prefix for organizing files (e.g., 'documents', 'cases', 'members')

        Returns:
            Dictionary with file information

        Raises:
            HTTPException: If upload fails
        """
        # Validate file type
        allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".gif", ".bmp", ".txt"}
        file_ext = os.path.splitext(file.filename)[1].lower()

        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )

        # Validate file size (10MB max)
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        file_content = await file.read()
        if len(file_content) > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of 10MB"
            )

        # Reset file pointer for reading
        await file.seek(0)

        try:
            # Upload to S3
            result = s3_service.upload_file(
                file_obj=file.file,
                filename=file.filename,
                folder=folder,
                content_type=file.content_type
            )

            return {
                "file_id": str(uuid.uuid4()),  # Generate unique ID for tracking
                "file_name": result['filename'],
                "file_type": file.content_type or "application/octet-stream",
                "file_size": len(file_content),
                "s3_key": result['file_key'],
                "s3_url": result['file_url'],
                "local_path": None
            }

        except Exception as e:
            # Fallback to local storage if S3 fails
            print(f"S3 upload failed: {str(e)}. Falling back to local storage...")

            file_id = str(uuid.uuid4())
            safe_filename = f"{file_id}{file_ext}"

            folder_path = os.path.join(self.upload_dir, folder)
            os.makedirs(folder_path, exist_ok=True)

            file_path = os.path.join(folder_path, safe_filename)
            await file.seek(0)

            with open(file_path, "wb") as f:
                f.write(await file.read())

            return {
                "file_id": file_id,
                "file_name": file.filename,
                "file_type": file.content_type or "application/octet-stream",
                "file_size": len(file_content),
                "local_path": file_path,
                "s3_key": None,
                "s3_url": None
            }

    async def generate_presigned_url(
        self,
        s3_key: str,
        expiration: int = 3600
    ) -> Optional[str]:
        """
        Generate a presigned URL for S3 object

        Args:
            s3_key: S3 object key
            expiration: URL expiration time in seconds (default: 1 hour)

        Returns:
            Presigned URL string or None if generation fails
        """
        try:
            return s3_service.generate_presigned_url(s3_key, expiration)
        except Exception as e:
            print(f"Failed to generate presigned URL: {str(e)}")
            return None

    async def delete_file(
        self,
        s3_key: Optional[str] = None,
        local_path: Optional[str] = None
    ) -> bool:
        """
        Delete a file from S3 or local storage

        Args:
            s3_key: S3 object key
            local_path: Local file path (fallback)

        Returns:
            True if deletion was successful
        """
        # Try S3 first
        if s3_key:
            try:
                return s3_service.delete_file(s3_key)
            except Exception as e:
                print(f"Failed to delete from S3: {str(e)}")

        # Fallback to local storage
        if local_path and os.path.exists(local_path):
            try:
                os.remove(local_path)
                return True
            except Exception as e:
                print(f"Failed to delete local file: {str(e)}")
                return False

        return False


# Create singleton instance
upload_service = UploadService()
