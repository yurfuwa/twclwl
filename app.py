import boto3
import json
import decimal

print('Loading function')
dynamo = boto3.resource('dynamodb')
table = dynamo.Table('tweet-share-link')

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)


def respond(err, res=None):
    return {
        'statusCode': '400' if err else '200',
        'body': '{}' if err or not res else json.dumps(res,cls=DecimalEncoder),
        'headers': {
            'Content-Type': 'application/json',
        },
    }


def lambda_handler(event, context):

    operations = {
        'DELETE': lambda table, x: table.delete_item(**x),
        'GET': lambda table, x: table.scan(),
        'POST': lambda table, x: table.put_item(Item=x),
        'PUT': lambda table, x: table.update_item(**x),
    }

    operation = event['httpMethod']
    if operation in operations:
        payload = None if operation == 'GET' else json.loads(event['body'])
        return respond(None, operations[operation](table, payload))
    else:
        return respond(ValueError('Unsupported method "{}"'.format(operation)))

