import asyncio
import os

try:
    from .utils import AsyncCutBrowserSession
except Exception as e:
    from utils import AsyncCutBrowserSession

SQS = os.environ.get('SQS', 'kendra-buttons-index-dev')


def operator(request, context):
    # 들어올 이벤트
    # page index ddb stream
    # cloud watch event

    print('run operator')
    print(request)
    # ddb stream case
    # 새로 추가된 url만 추출
    # site 정보 가져오기 정책 및 메타데이터
    # sqs에 작업 넣기

    # page 삭제시
    # 삭제된 페이지의 인덱스ID를 이용해 켄드라 색인에서 해당 리소스 삭제 하기

    # cloud watch case
    # site 정보 가져오기 정책 및 메타데이터 및 entrypoint url
    # sqs에 작업 넣기


def worker(request, context):
    print('run worker')
    print(request)

    # 최대 10개의 url이 들어옴
    # que에 담긴 수집 url을 이용하여 html일 가져오기
    # html을 que에 담긴 메타와 함께 kendra에 넣기
    # page index ddb에 해당 url 수집 완료 처리 및 인덱스ID도 같이 넣기
    # html에 있는 url을 추출후 수집 정책에 부합한 url만 page index ddb에 추가


async def get_page(url: str):
    session = AsyncCutBrowserSession()
    print(f'start scrap {url}')
    req = await session.get(url)
    await req.html.arender()
    result = req.html
    print(req.html.absolute_links)
    print(result)
    return result



if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(get_page('https://brownbears.tistory.com/140'))
