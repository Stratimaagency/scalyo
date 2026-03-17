from .models import Account


class AccountImportService:
    """SRP: Handles bulk import of accounts for a company."""

    @staticmethod
    def import_accounts(company, accounts_data):
        created = []
        for row in accounts_data:
            acc = Account.objects.create(
                company=company,
                name=row.get('name', ''),
                csm=row.get('csm', ''),
                arr=row.get('arr', 0),
                health=row.get('health', 70),
                risk=row.get('risk', 'low'),
                plan=row.get('plan', ''),
                contact=row.get('contact', ''),
                contact_email=row.get('contact_email', ''),
                notes=row.get('notes', ''),
            )
            created.append(acc.id)
        return created
