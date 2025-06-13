from rest_framework.exceptions import APIException
from rest_framework import status

class InvalidEmojiException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid emoji provided'
    default_code = 'invalid_emoji'

class InvalidParentCommentException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Parent comment must belong to the same post'
    default_code = 'invalid_parent_comment'

class PostNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Post not found'
    default_code = 'post_not_found' 