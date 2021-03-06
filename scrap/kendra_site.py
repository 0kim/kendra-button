import os
import random
from pprint import pprint
import graphene
from graphene_pynamodb import PynamoObjectType
from pynamodb.attributes import UnicodeAttribute
from pynamodb.models import Model
from flask import request

DB = os.environ.get('siteDB', 'kendra-buttons-index-dev')
SAMPLE_USER = 'sample'


class Site(Model):
    class Meta:
        table_name = DB
        region = 'us-west-2'

    user = UnicodeAttribute(hash_key=True)
    site = UnicodeAttribute(range_key=True)
    domain = UnicodeAttribute()
    scrap_endpoint = UnicodeAttribute()


class CrawlerStatus(graphene.ObjectType):
    total = graphene.Int()
    done = graphene.Int()


class SiteNode(PynamoObjectType):
    class Meta:
        model = Site

    crawler_status = graphene.Field(CrawlerStatus)

    def resolve_crawler_status(self, info, ):
        return CrawlerStatus(total=100, done=random.randrange(10, 100))


class SiteList(graphene.ObjectType):
    items = graphene.List(SiteNode)
    last_key = graphene.String()

def get_user():
    user = request.environ['serverless.event'].get('requestContext',{}).get('authorizer',{}).get('claims',{}).get('cognito:username')
    print(user)
    return user

class Query:
    sites = graphene.List(SiteNode)
    sites_page_nation = graphene.Field(SiteList, page_size=graphene.Int(), last_key=graphene.String())

    site = graphene.Field(SiteNode, site=graphene.String())

    def resolve_site(self, info, site: str):
        return Site.get(get_user(), site)

    def resolve_sites(self, info):
        results = []
        try:
            results = list(Site.query(get_user()))
        except Exception as e:
            print(e)
        return results

    def resolve_sites_page_nation(self, info, page_size=5, last_key=None):
        user = get_user()
        print(user)
        args = {
            "page_size": page_size
        }
        if last_key:
            args['last_evaluated_key'] = last_key
        results = []
        try:
            results = list(Site.query(user, **args))
        except Exception as e:
            print(e)
            
        return SiteList(
            items=results,
            last_key=results.last_evaluated_key
        )


class SiteCreate(graphene.Mutation):
    class Arguments:
        site = graphene.String(required=True)
        domain = graphene.String(required=True)
        scrap_endpoint = graphene.String(required=True)

    site = graphene.Field(SiteNode)

    def mutate(self, info, site, domain,scrap_endpoint):
        user = get_user()
        if Site.count(user, Site.site == site):
            raise Exception('duplicated site name')
        data = Site(user, site, domain=domain,scrap_endpoint=scrap_endpoint)
        data.save()
        return SiteCreate(site=data)

class SiteUpdate(graphene.Mutation):
    class Arguments:
        site = graphene.String(required=True)
        domain = graphene.String(required=False)

    site = graphene.Field(SiteNode)

    def mutate(self, info, site, domain=None):
        user = get_user()            
        try:
            item = Site.get(user, site)
        except Exception as e:
            raise Exception('there is no site')
        actions = []
        if domain:
            actions.append(Site.domain.set(domain))
        if actions:
            item.update(actions=actions)
        return SiteUpdate(site=item)

class SiteDelete(graphene.Mutation):
    class Arguments:
        site = graphene.String(required=True)

    ok = graphene.Boolean()

    def mutate(self, info, site):
        try:
            data = Site(get_user(), site).delete()
        except Exception as e:
            print(e)
            return SiteDelete(ok=False)
        return SiteDelete(ok=True)


class Mutation:
    create_site = SiteCreate.Field()
    update_site = SiteUpdate.Field()
    delete_site = SiteDelete.Field()
