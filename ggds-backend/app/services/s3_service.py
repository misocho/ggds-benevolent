"""
AWS S3 Service for file storage and management
"""
import boto3
from botocore.exceptions import ClientError
from typing import Optional, BinaryIO
import uuid
from datetime import datetime, timedelta
import mimetypes
import os

from app.config import settings


class S3Service:
    """Service for handling AWS S3 operations"""

    def __init__(self):
        """Initialize S3 client"""
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region
        )
        self.bucket_name = settings.aws_s3_bucket

    def upload_file(
        self,
        file_obj: BinaryIO,
        filename: str,
        folder: str = "documents",
        content_type: Optional[str] = None
    ) -> dict:
        """
        Upload a file to S3

        Args:
            file_obj: File-like object to upload
            filename: Original filename
            folder: S3 folder/prefix (e.g., 'documents', 'profile-photos')
            content_type: MIME type of the file

        Returns:
            dict: {
                'file_key': str,  # S3 object key
                'file_url': str,  # Public URL (if bucket is public)
                'bucket': str,    # Bucket name
                'filename': str   # Original filename
            }
        """
        # Generate unique filename
        file_extension = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_key = f"{folder}/{unique_filename}"

        # Detect content type if not provided
        if not content_type:
            content_type, _ = mimetypes.guess_type(filename)
            if not content_type:
                content_type = 'application/octet-stream'

        try:
            # Upload file to S3
            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                file_key,
                ExtraArgs={
                    'ContentType': content_type,
                    'Metadata': {
                        'original_filename': filename,
                        'uploaded_at': datetime.utcnow().isoformat()
                    }
                }
            )

            # Generate file URL
            file_url = f"https://{self.bucket_name}.s3.{settings.aws_region}.amazonaws.com/{file_key}"

            return {
                'file_key': file_key,
                'file_url': file_url,
                'bucket': self.bucket_name,
                'filename': filename
            }

        except ClientError as e:
            raise Exception(f"Failed to upload file to S3: {str(e)}")

    def generate_presigned_url(
        self,
        file_key: str,
        expiration: int = 3600
    ) -> str:
        """
        Generate a presigned URL for downloading a file

        Args:
            file_key: S3 object key
            expiration: URL expiration time in seconds (default: 1 hour)

        Returns:
            str: Presigned URL
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': file_key
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            raise Exception(f"Failed to generate presigned URL: {str(e)}")

    def generate_presigned_upload_url(
        self,
        file_key: str,
        content_type: str,
        expiration: int = 3600
    ) -> dict:
        """
        Generate a presigned URL for uploading a file directly from client

        Args:
            file_key: S3 object key where file will be stored
            content_type: MIME type of the file
            expiration: URL expiration time in seconds (default: 1 hour)

        Returns:
            dict: {
                'url': str,  # Presigned URL for PUT request
                'fields': dict,  # Additional fields to include in the request
                'file_key': str  # The key where file will be stored
            }
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': file_key,
                    'ContentType': content_type
                },
                ExpiresIn=expiration
            )
            return {
                'url': url,
                'file_key': file_key,
                'method': 'PUT'
            }
        except ClientError as e:
            raise Exception(f"Failed to generate presigned upload URL: {str(e)}")

    def delete_file(self, file_key: str) -> bool:
        """
        Delete a file from S3

        Args:
            file_key: S3 object key

        Returns:
            bool: True if successful
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            return True
        except ClientError as e:
            raise Exception(f"Failed to delete file from S3: {str(e)}")

    def file_exists(self, file_key: str) -> bool:
        """
        Check if a file exists in S3

        Args:
            file_key: S3 object key

        Returns:
            bool: True if file exists
        """
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            return True
        except ClientError:
            return False

    def get_file_metadata(self, file_key: str) -> dict:
        """
        Get metadata for a file in S3

        Args:
            file_key: S3 object key

        Returns:
            dict: File metadata
        """
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            return {
                'content_type': response.get('ContentType'),
                'content_length': response.get('ContentLength'),
                'last_modified': response.get('LastModified'),
                'metadata': response.get('Metadata', {})
            }
        except ClientError as e:
            raise Exception(f"Failed to get file metadata: {str(e)}")

    def list_files(self, prefix: str = "", max_keys: int = 1000) -> list:
        """
        List files in S3 bucket with optional prefix

        Args:
            prefix: Filter files by prefix (folder path)
            max_keys: Maximum number of files to return

        Returns:
            list: List of file information dictionaries
        """
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )

            files = []
            for obj in response.get('Contents', []):
                files.append({
                    'key': obj['Key'],
                    'size': obj['Size'],
                    'last_modified': obj['LastModified'],
                    'url': f"https://{self.bucket_name}.s3.{settings.aws_region}.amazonaws.com/{obj['Key']}"
                })

            return files
        except ClientError as e:
            raise Exception(f"Failed to list files: {str(e)}")


# Create global S3 service instance
s3_service = S3Service()
