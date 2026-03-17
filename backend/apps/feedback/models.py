from django.db import models


class Feedback(models.Model):
    CATEGORY_CHOICES = [
        ('bug', 'Bug'),
        ('feature', 'Feature Request'),
        ('improvement', 'Improvement'),
        ('other', 'Other'),
    ]
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]

    user = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE, related_name='feedbacks'
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    rating = models.IntegerField(choices=RATING_CHOICES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback: {self.user.email} - {self.category}"
