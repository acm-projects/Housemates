## File Structure

```text
/housemates
├── Frontend/
│   ├── app.json
│   ├── package.json
│   ├── babel.config.js
│   ├── metro.config.js
│   ├── .env
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── types/
│   ├── App.tsx
│   └── README.md
│
└── Backend/
    ├── template.yaml
    ├── package.json
    ├── events/
    ├── layers/
    ├── shared/
    │   ├── utils/
    │   ├── middleware/
    │   └── types/
    ├── functions/
    │   ├── examplefunction1/ 
    │   │   ├── handler.ts
    │   │   └── package.json
    │   └── examplefunction2/
    │       ├── handler.ts
    │       └── package.json
    └── README.md
```

### `Frontend/`

Expo React Native application codebase.

- `assets/`: Static files such as images, icons, and fonts.
- `src/components/`: Reusable UI components.
- `src/screens/`: App screens/pages.
- `src/navigation/`: Navigation stacks, tabs, and routing setup.
- `src/services/`: API clients and external service integrations.
- `src/store/`: State management (Redux/Zustand/Context).
- `src/utils/`: Shared utility/helper functions.
- `src/constants/`: App-wide constants.
- `src/types/`: TypeScript types/interfaces.
- `App.tsx`: Expo entry component.

### `Backend/`

Serverless backend built with AWS Lambda functions.

- `functions/`: Individual Lambda handlers by feature/domain.
- `shared/`: Common backend utilities, middleware, and shared types.
- `layers/`: AWS Lambda Layers for shared dependencies.
- `events/`: Sample payloads for local testing.
- `template.yaml`: Infrastructure definition (SAM/CloudFormation).
- `package.json`: Backend dependency and scripts config.
