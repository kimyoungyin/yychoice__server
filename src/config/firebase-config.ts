import admin from "firebase-admin";
const params = {
    type: process.env.FIREBASE_ADMIN_TYPE,
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_ADMIN_CLIENT_ID,
    authUri: process.env.FIREBASE_ADMIN_AUTH_URI,
    tokenUri: process.env.FIREBASE_ADMIN_TOKEN_URI,
    authProviderX509CertUrl:
        process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
    clientC509CertUrl: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
};

admin.initializeApp({
    credential: admin.credential.cert(params),
});

export default admin;
