from .models import Account


class AccountImportService:
    """SRP: Handles bulk import of accounts for a company."""

    @staticmethod
    def import_accounts(company, accounts_data):
        created = []
        for row in accounts_data:
            mrr_val = row.get('mrr', 0)
            acc = Account.objects.create(
                company=company,
                name=row.get('name', ''),
                csm=row.get('csm', ''),
                mrr=mrr_val,
                arr=row.get('arr', 0) or (float(mrr_val) * 12 if mrr_val else 0),
                industry=row.get('industry', ''),
                usage=row.get('usage', 70),
                health=row.get('health', 70),
                risk=row.get('risk', 'low'),
                plan=row.get('plan', ''),
                contact=row.get('contact', ''),
                contact_email=row.get('contact_email', ''),
                renewal=row.get('renewal', ''),
                notes=row.get('notes', ''),
            )
            created.append(acc.id)
        return created
