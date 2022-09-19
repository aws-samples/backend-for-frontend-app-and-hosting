import {Stack, StackProps, Stage, StageProps, Expiration, CfnOutput} from 'aws-cdk-lib';
import {Construct} from 'constructs';

import * as appsync from '@aws-cdk/aws-appsync-alpha';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as utils from '../lib/utils'

export interface BackendProps extends StackProps {
    readonly siteDomain: string
  }

export class BackendStack extends Stack {
    public readonly apiId: CfnOutput;
    public readonly apiUrl: CfnOutput;
    public readonly apiKey: CfnOutput;

    constructor(scope: Construct, id: string, props: BackendProps) {
        super(scope, id, props);

        const KEY_EXPIRATION_DATE = utils.dateFromNow(7);

        // Define AppSync API
        const api = new appsync.GraphqlApi(this, 'BffAPI', {
            name: 'BffAPI',
            // create schema using our schema definition
            schema: appsync.Schema.fromAsset('api/schema.graphql'),
            // Authorization mode
            authorizationConfig: {
            defaultAuthorization: {
                authorizationType: appsync.AuthorizationType.API_KEY,
                apiKeyConfig: {
                    name: 'default',
                    description: 'default auth mode',
                    expires: Expiration.atDate(KEY_EXPIRATION_DATE),
                },
            },
            },
        })

         // Define the DynamoDB table with partition key and sort key
        const table = new ddb.Table(this, 'DataPointTable', {
            partitionKey: { name: 'name', type: ddb.AttributeType.STRING },
            sortKey: { name: 'createdAt', type: ddb.AttributeType.STRING },
        })


        // Set up table as a Datasource and grant access
        const dataSource = api.addDynamoDbDataSource('dataPointSource', table)

        // Define resolvers
        dataSource.createResolver({
            typeName: 'Mutation',
            fieldName: 'createDataPoint',
            requestMappingTemplate: appsync.MappingTemplate.fromFile(
                'api/resolvers/Mutation.createDataPoint.req.vtl'
            ),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
        })

        dataSource.createResolver({
            typeName: 'Query',
            fieldName: 'queryDataPointsByNameAndDateTime',
            requestMappingTemplate: appsync.MappingTemplate.fromFile(
                'api/resolvers/Query.queryDataPointsByNameAndDateTime.req.vtl'
            ),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
        })

        // Stack Outputs
        this.apiId = new CfnOutput(this, 'GraphQLAPI_ID', { value: api.apiId })
        this.apiUrl = new CfnOutput(this, 'GraphQLAPI_URL', { value: api.graphqlUrl })
        this.apiKey = new CfnOutput(this, 'GraphQLAPI_KEY', { value: api.apiKey || '' })
  
    }
}

export interface BackendProps extends StageProps {
    readonly siteDomain: string
}

export class BackendStage extends Stage {
    public readonly apiId: CfnOutput;
    public readonly apiUrl: CfnOutput;
    public readonly apiKey: CfnOutput;

    constructor(scope: Construct, id: string, props: BackendProps) {
        super(scope, id, props);

        const backend = new BackendStack(this, 'Backend', props);
        
        this.apiId = backend.apiId;
        this.apiUrl = backend.apiUrl;
        this.apiKey = backend.apiKey;
    }
}
