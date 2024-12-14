# JWT Authentication

Implementation guide for adding secure JWT authentication to the marketplace iframe.

## Code Examples
- Implementation: [list_jwt.tsx](./src/pages/integrations/list_jwt.tsx)
- JWT Generator: [jwtGenerator.ts](./src/pages/utils/jwtGenerator.ts)

## JWT Implementation

### User Identity Integration
```typescript
const { data: user, isLoading: userLoading } = useGetIdentity();
```

### Token Generation
```typescript
const getNewJwtToken = useCallback(() => {
    if (!user) return null;
    return generateUserJWT(user);
}, [user]);
```

### JWT Configuration
```typescript
interface JWTPayload {
    email: string;
    ufn: string;
    uln: string;
    fields: UserFields;
    account: AccountInfo;
    exp: number;
}
```

### Token Implementation
```typescript
const payload: JWTPayload = {
    email: user.email,
    ufn: user.name.split(' ')[0],
    uln: user.name.split(' ')[1],
    fields: {
        user_type: user.role || 'User',
    },
    account: {
        external_id: 'refine.com',
        name: 'Refine',
        tier: 'Enterprise',
    },
    exp: Math.floor(Date.now() / 1000) + (5 * 60)
};
```

## Security Considerations

### Token Expiration
- 5-minute expiration time
- Automatic renewal process
- Expiration calculation: `Math.floor(Date.now() / 1000) + (5 * 60)`

### Environment Configuration
```env
JWT_SECRET=your_secure_secret_here
```

### User Roles Configuration
```typescript
const USER_ROLES = {
    ADMIN: 'Admin',
    USER: 'User',
    GUEST: 'Guest'
};
```

## Production Considerations

### Environment Variables
- Move JWT_SECRET to environment variables
- Configure different secrets per environment
- Implement secure secret management

### Token Security
- Implement token rotation
- Add token blacklisting
- Monitor token usage

### Error Handling
- Token refresh errors
- Generation failures
- Security event logging

## Next Steps
- Implement full integration management - See [Integration Management](./integration-management.md)
- Review security guidelines - See [Security Guidelines](./security.md)