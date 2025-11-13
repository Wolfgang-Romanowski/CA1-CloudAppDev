## Assignment - Cloud App Development.

__Name:__ Wolfgang Romanowski

### Links.
__Demo:__ [A link to your YouTube video demonstration.]](https://youtu.be/HECWSqWraZE)]

### Screenshots.

[A screenshot of the App Web API from the management console

<img width="1604" height="792" alt="apiauth" src="https://github.com/user-attachments/assets/d953248f-24e0-41e3-ab01-f076faf546f7" />

[A screenshot of your seeded table from DynamoDB, e.g.

<img width="1258" height="315" alt="db" src="https://github.com/user-attachments/assets/a3f3e05b-ec54-4201-b0d7-6e94ab4f0a74" />

[A screenshot from CloudWatch logs showing an example of User Activity logging]
<img width="1619" height="354" alt="logs" src="https://github.com/user-attachments/assets/ae8ac55e-b53e-48de-a24f-7c186f3e37c3" />



### Design Features

AppApi Construct: A custom L2 construct that encapsulates all App API resources including six Lambda functions and API gateway config and custom authorizer setup and DynamoDB permissions.

AuthApi Construct: A separate L2 construct managing authentication endpoints.

Single Stack Architecture: All resources are deployed in a single CDK stack (`Ca1CloudDevStack`) for simplicity.

### Extra Features

DynamoDB Streams with Event Source Mapping: Configured DynamoDB streams with automatic Lambda triggers for state change logging
