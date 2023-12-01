from __future__ import print_function
import logging
import os
import json
import requests
import boto3
import uuid
from datetime import datetime
from aws_xray_sdk.core import patch_all

patch_all()

LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
AWS_SECRET_KEY = None
AWS_ACCESS_KEY = None

logger = logging.getLogger()
logger.setLevel(LOG_LEVEL)

# -------------------------------------UTILS----------------------------------


def validateDate(date_string, date_format):
    try:
        date_obj = datetime.strptime(date_string, date_format)
        return True
    except Exception as e:
        return False


def is_property_missing(property_name, data):
    return property_name not in data or data[property_name] is None


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
    api_url = "{}{}".format(os.environ.get("NOMAD_BACKEND_URL", ""), endpoint_part)
    try:
        logger.debug('SEND Data to NomadBackend {}'.format(data))
        response = requests.post(api_url, json=data, headers=headers, timeout=20)

        if response.status_code == 200:
            return {
                "statusCode": 200,
                "success": True,
                "body": {"status": "ok"}
            }

        elif response.status_code == 404:
            return {
                "statusCode": 404,
                "success": False,
                "body": {"status": "ko"}
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
        logger.error('Nomad - 500.1 - Timeout - update_wo_post_request.')
        return {
            "statusCode": 500,
            "success": False,
            "body": 'Nomad - Timeout - intervention'
        }

    except Exception as e:
        logger.error('Nomad - 500.2 - Exception {} - intervention : {}'.format(e, data['refExterneDI']))
        return {
            "statusCode": 500,
            "success": False,
            "body": json.dumps({
                "code": "500.2",
                "message": "An error is occured. Contact your administrator."
            })
        }


def update_dt_wo_lambda_handler(event, context):

    if is_property_missing('id', event["body"]) or event["body"]['id'].strip() == '':
        logger.debug('id is required')
        return {
            'statusCode': 400,
            "success": False,
            'body': 'id is required'
        }

    if is_property_missing('completionStartDate', event["body"]):
        logger.debug('completionStartDate is required')
        return {
            'statusCode': 400,
            "success": False,
            'body': 'completionStartDate is required'
        }

    if is_property_missing('completionEndDate', event["body"]):
        logger.debug('completionEndDate is required')
        return {
            'statusCode': 400,
            "success": False,
            'body': 'completionEndDate is required'
        }

    if is_property_missing('agent', event["body"]):
        logger.debug('agent is required')
        return {
            'statusCode': 400,
            "success": False,
            'body': 'agent is required'
        }

    resp = update_wo_post_request(data=event["body"],
                                  endpoint_part='/api/nomad/v1/basic/external/exploitation/workorders/updateCompletion')
    if resp['statusCode'] != 200 and  resp['statusCode'] != 404:
        return {
            "statusCode": 500,
            "success": False,
            "body": json.dumps({
                "code": "500.1",
                "message": "An error is occured. Contact your administrator."
            })
        }

    return resp

