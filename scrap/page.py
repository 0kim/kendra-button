import os

from pynamodb.attributes import UnicodeAttribute, BooleanAttribute
from pynamodb.models import Model

DB = os.environ.get('pageDB', 'kendra-buttons-index-dev')
SAMPLE_USER = 'sample'


class Page(Model):
    class Meta:
        table_name = DB
        region = 'us-west-2'

    site = UnicodeAttribute(hash_key=True)
    url = UnicodeAttribute(range_key=True)
    _type = UnicodeAttribute(attr_name="type")
    scraped = BooleanAttribute(default=False)


if __name__ == '__main__':
    p = Page("asta", "https://www.yna.co.kr/index?site=header_logo", _type="html")

    p.save()
