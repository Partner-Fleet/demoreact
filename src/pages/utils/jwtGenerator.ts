// utils/jwtGenerator.ts
import encode from 'jwt-encode';

const JWT_SECRET = 'thisismyspecialsecret'; // Move this to environment variables in production

interface UserFields {
    user_type: string;
}

interface AccountInfo {
    external_id: string;
    name: string;
    tier: string;
}

interface JWTPayload {
    email: string;
    ufn: string;
    uln: string;
    fields: UserFields;
    account: AccountInfo;
    exp: number;
}

export const generateUserJWT = (user: any): string => {
    // Calculate expiration (current time + 5 minutes)
    const exp = Math.floor(Date.now() / 1000) + (5 * 60);

    // console.log(user)
    const payload: JWTPayload = {
        email: user.email,
        ufn: user.name.split(' ')[0] || 'First',  // Assuming name is "First Last"
        uln: user.name.split(' ')[1] || 'Last',
        fields: {
            user_type: user.role || 'User',
        },
        account: {
            external_id: 'Demo Account',
            name: 'Demo Account',  // You can make this dynamic
            tier: 'Enterprise',
        },
        exp: exp
    };

    return encode(payload, JWT_SECRET);
};