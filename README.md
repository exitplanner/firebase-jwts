# firebase-jwts

A Cloud Function for combining JWT main and session keys from Firebase, to enable Hasura to check the JWTs for both Firebase session tokens and client tokens with the same setup.

It simply combines the JWT signing keys from Firebase for both normal and session tokens.

## Purpose

In Firebase, JWT tokens are signed with keys that exist at different urls.
1. Browser (client) tokens are signed with keys that exist at: `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`
2. Session tokens (created via the admin API) are signed with keys that can be fetched from `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`

This is a problem when using Firebase authentication with Hasura using [their default guide](https://hasura.io/docs/latest/auth/authentication/jwt/) which suggest url 1. as the JWT url. This will reject all session tokens, because they are signed with different keys.

The cloud/enterprise version of Hasura supports multiple JWTs via configuration, but the open source version does not (see [this issue](https://github.com/hasura/graphql-engine/issues/2208#issuecomment-1110654330)).

## Deploy to Cloud Functions

The following commands will create a Google Cloud Function called firebase-jwts

```shell
npm run build
gcloud functions deploy firebase-jwts --region=europe-west1 --runtime=nodejs16 --allow-unauthenticated --trigger-http --source ./build --entry-point=fetchJwts
```

## How to use with Hasura

After deploying this Cloud Function, use the following Hasura configuration:

```
HASURA_GRAPHQL_JWT_SECRET={ "jwk_url": "https://region-projectid.cloudfunctions.net/firebase-jwts", "audience": "projectid" }
```

The `audience` part is important, according to the Hasura documentation.
