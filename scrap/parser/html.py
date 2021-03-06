import asyncio
import io
import os

import boto3

try:
    from .utils import AsyncCutBrowserSession, make_obj_name, make_simple_obj_name
except Exception as e:
    from utils import AsyncCutBrowserSession, make_obj_name, make_simple_obj_name

BUCKET = os.environ.get('BUCKET', 'kendra-button')

s3 = boto3.resource('s3')


async def get_page(site: str, url: str, base_path='', recursive=False) -> set:
    session = AsyncCutBrowserSession()
    print(f'start scrap {url}')
    req = await session.get(url)
    await req.html.arender()
    obj_path = make_simple_obj_name(site, url )
    data = io.BytesIO(req.html.raw_html)
    s3.Bucket(BUCKET).put_object(Key=f'{obj_path}', Body=data)
    print(f'save it! {obj_path=}')
    if recursive:
        child_links = list(filter(lambda x: base_path in x, req.html.absolute_links, ))
        print(child_links)


if __name__ == '__main__':
    asyncio.run(get_page('https://brownbears.tistory.com/140'))
