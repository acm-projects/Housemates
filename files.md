## File Structure

```text
/housemates
├── Frontend/
      (Whatever frontend stuff y'all need)
│
├── Backend/
    ├── template.yaml
    ├── package.json
    ├── types/
    ├── functions/
    │   ├── examplefunction1/ 
    │   │   ├── handler.ts
    │   │   └── package.json
    │   └── examplefunction2/
    │       ├── handler.ts
    │       └── package.json
```

### `Frontend/`

Expo React Native application codebase.

### `Backend/`

Serverless backend built with AWS Lambda functions.

- `functions/`: Individual Lambda handlers by feature/domain.
- types/: Shared Types
- `template.yaml`: Infrastructure definition (SAM/CloudFormation).
- `package.json`: Backend dependency and scripts config.
