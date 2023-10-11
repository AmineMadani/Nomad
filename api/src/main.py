from __future__ import print_function
import logging
import os
import json
import customException
import requests
import boto3
import uuid
from datetime import datetime
import base64
import utils
from SQSClientExtended import SQSClientExtended
import re
import time
import ast
import csv
#from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all

patch_all()

LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
AWS_SECRET_KEY = None
AWS_ACCESS_KEY = None

logger = logging.getLogger()
logger.setLevel(LOG_LEVEL)

dynamodb = boto3.resource('dynamodb')

table_incoming = dynamodb.Table(os.environ.get("NOMAD_DYNAMODB_TABLE_INCOMING", ""))
table_outcoming = dynamodb.Table(os.environ.get("NOMAD_DYNAMODB_TABLE_OUTCOMING", ""))
table_praxedo = dynamodb.Table(os.environ.get("NOMAD_DYNAMODB_TABLE_PRAXEDO", "moveo-bouchon-praxedo-rec"))
table_waterp = dynamodb.Table(os.environ.get("NOMAD_DYNAMODB_TABLE_WATERP", "moveo-planif-rec"))


# -------------------------------------UTILS----------------------------------


def validateDate(date_string, date_format):
    try:
        date_obj = datetime.strptime(date_string, date_format)
        return True
    except Exception as e:
        return False


def is_property_missing(property_name, data):
    return property_name not in data or data[property_name] is None


def log_incoming_rejected_messages(item_reject_code,
                                   item_message,
                                   error_message,
                                   item_status,
                                   item_comment,
                                   message_id=""):
    try:

        now = datetime.now().strftime("%Y%m%d%H%M%S%f")
        item_id = str(now) + '-' + str(uuid.uuid4())
        response = table_incoming.put_item(
            Item={
                'item_id': item_id,
                'item_reject_code': item_reject_code,
                'item_message': item_message,
                'error_message': error_message,
                'item_status': item_status,
                'item_comment': item_comment,
                'message_id': message_id
            }
        )

    except Exception as e:
        logger.error('Nomad - log_incoming_rejected_messages : ' + str(e))


def log_outcoming_rejected_messages(item_reject_code,
                                    item_message,
                                    error_message,
                                    item_status,
                                    item_comment):
    try:
        now = datetime.now().strftime("%Y%m%d%H%M%S%f")
        item_id = str(now) + '-' + str(uuid.uuid4())
        response = table_outcoming.put_item(
            Item={
                'item_id': item_id,
                'item_reject_code': item_reject_code,
                'item_message': item_message,
                'error_message': error_message,
                'item_status': item_status,
                'item_comment': item_comment
            }
        )

    except Exception as e:
        logger.error('Nomad - log_outcoming_rejected_messages : ' + str(e))


def get_wo_lambda_handler(event, context):
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Python Lambda',
        'Authorization': 'Basic {}'.format(os.environ["NOMAD_BACKEND_CREDENTIALS"]),
        'Accept': 'application/json'}

    api_url = '{}/api/intervention/basic/v1/searchClienteleInterventions' \
        .format(os.environ.get("NOMAD_BACKEND_URL", ""))

    try:
        response = requests.get(api_url, headers=headers, params=event["query"], timeout=20)

        if response.status_code == 200:
            return {
                "statusCode": 200,
                "success": True,
                "body": response.json()
            }
        else:
            logger.error('Nomad - get_wo_lambda_handler - ' + str(response.status_code) + ' - ' +
                         json.dumps(event["query"]))
            logger.error('Nomad - get_wo_lambda_handler - ' + str(response.status_code) + ' - ' +
                         'The error message is :' + json.dumps(response.json()))
            return {
                "statusCode": response.status_code,
                "success": False,
                "body": response.json()
            }

    except Exception as e:
        logger.error('Nomad - 500.1 - ' + json.dumps(event["query"]))
        logger.error('Nomad - 500.1 - ' + 'the error message is :' + str(e))
        return {
            "statusCode": 500,
            "success": False,
            "body": json.dumps({
                "code": "500.1",
                "message": "An error is occured. Contact your administrator.",
            })}


def update_wo_post_request(data, endpoint_part):
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Python Lambda',
        'Authorization': 'Basic {}'.format(os.environ.get("NOMAD_BACKEND_CREDENTIALS", "")),
        'Accept': 'application/json'}
    api_url = '{}{}'.format(os.environ.get("NOMAD_BACKEND_URL", endpoint_part), )
    try:
        logger.debug('SEND Data to NomadBackend {}'.format(data))
        response = requests.post(api_url, json=data, headers=headers, timeout=20)

        if response.status_code == 200:
            return {
                "statusCode": 200,
                "success": True,
                "body": str(response.content)
            }
        else:
            logger.error('Nomad - update_wo_post_request - SEND - ' + json.dumps(data))
            logger.error('Nomad - update_wo_post_request - RECEIVE - ' + str(
                response.status_code) + ' - ' + 'The error message is :' + str(response.content))

            return {
                "statusCode": response.status_code,
                "success": False,
                "body": str(response.content)
            }

    except requests.exceptions.ReadTimeout:
        logger.error('Nomad - 500.1 - Timeout - update_wo_post_request : {}'.format(data['refExterneDI']))
        return {
            "statusCode": 500,
            "success": False,
            "body": 'Nomad - Timeout - intervention : {}'.format(str(data['refExterneDI']))
        }

    except Exception as e:
        logger.error('Nomad - 500.2 - Exception {} - intervention : {}'.format(e, data['refExterneDI']))
        return {
            "statusCode": 500,
            "success": False,
            "body": json.dumps({
                "code": "500.2",
                "message": "An error is occured. Contact your administrator.",
            })
        }


def update_wo_lambda_handler(event, context):

    if is_property_missing('refExterneIns', event["body"]) or event["body"]['refExterneIns'].strip() == '':
        logger.debug('refExterneIns is required')
        return {
            'statusCode': 400,
            "success": False,
            'body': 'refExterneIns is required'
        }

    if is_property_missing('origine', event["body"]):
        logger.debug('origine is required')
        return {
            'statusCode': 400,
            "success": False,
            'body': 'origine is required'
        }

    if is_property_missing('codeCommuneInsee', event["body"]):
        logger.debug('codeCommuneInsee is required')
        return {
            'statusCode': 400,
            "success": False,
            'body': 'codeCommuneInsee is required'
        }

    if is_property_missing('codeContrat', event["body"]):
        logger.debug('codeContrat is required')
        return {
            'statusCode': 400,
            "success": False,
            'body': 'codeContrat is required'
        }

    if is_property_missing('codeActivite', event["body"]):
        logger.debug('codeActivite is required')
        return {
            'statusCode': 400,
            "success": False,
            'body': 'codeActivite is required'
        }

    resp = update_wo_post_request(data=event["body"],
                                  endpoint_part='/api/nomad/v1/basic/external/exploitation/workorders/updateCompletion')
    if resp['statusCode'] != 200:
        return {
            "statusCode": 500,
            "success": False,
            "body": json.dumps({
                "code": "500.1",
                "message": "An error is occured. Contact your administrator.",
            })
        }

    return resp

