# **Project presentation** 

The Issuance Credential Protocol is a project which responds to the following needs : 
			- Build a standardized Credential Issuer in accordance with the OIDC4VCI and OIDC4VP latest protocols. It generate and signs VC, manage user's demand through the Portal and back offices.
			- Build a standardized user Portal.
			- Build a standardized getway solution between the ICP and the different backoffices which  need the SSI solution provided by Gaia-X.


# **OIDC4VCI main workflow**

The latest  [OIDC4VCI ](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html) specifications clarify the following endpoints : 
		- [The Credential Offer endpoint](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#name-credential-offer-endpoint) : This endpoint is responsible for sending the available Verifiable Credentials to the user. We use our Credential Issuer Component to manage this route and logic.
		- [The authorization endpoint](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#name-authorization-endpoint) : This endpoint verifies the user and sends back the authorisation token. (This route will also include the [token endpoint](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#name-token-endpoint) in our use case)
		- The [Credential Endpoint](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#name-credential-endpoint) which accepts the authorization token and proofs to build the VC and sends it back to the user. We use our Credential Issuer Component to manage this route and logic.

# **Employee credentials workflow** 



```mermaid
sequenceDiagram
    participant BackOffice as Back Office
    participant CredentialIssuer as Credential Issuer
    participant Portal
    participant Employee
    BackOffice->>CredentialIssuer: 1. Send List of Verifiable Credentials
    CredentialIssuer->>Portal: 2. Send List of Verifiable Credentials
    Employee->>CredentialIssuer: 3. Select a Verifiable Credential
    CredentialIssuer->>BackOffice: 4. Get Specific Login Methodology
    CredentialIssuer->>Portal: 5. Send Specific Login Methodology
```

At this stage we consider the following points : 
		- The Credential Issuer is aware of the Verifiable Credentials list as well as all login methodologies. These data are stored in memory with a regular update from the different back offices.

**Classical authentication**

We consider classical authentication in the case of an Employee initial VC offering. The Employee needs to connect to the back office specific workflow (in this case we consider Keycloak).
A successful backoffice connection will return an authorization token to the ICP. This token as well as the user data returned by the back office uppon login will let the ICP build and sign the VC and send it to the user.

```mermaid
sequenceDiagram
    participant BackOffice as Back Office
    participant CredentialIssuer as Credential Issuer
    participant Portal
    participant Employee
    participant Wallet

    Note over BackOffice,Employee: OIDC4VCI Credential Offer Endpoint 
    Note over BackOffice,Portal: Get http://localhost:3002/list
    BackOffice->>CredentialIssuer: 1. Sends List of Verifiable Credentials
    CredentialIssuer->>Portal: 2. Sends List of Verifiable Credentials
    
    

    Note over BackOffice,Employee: OIDC4VCI Authorization Endpoint
    Note over BackOffice,Employee: Post http://localhost:3002/login
    Employee->>CredentialIssuer: 3. Selects a Verifiable Credential
    CredentialIssuer->>Portal: 4. Sends Keycloak configuration URL
    Employee->>BackOffice: 5. Connects to Back Office (Keycloak)
    BackOffice->>Portal: 6. Returns Authorization Token & User Data

    Note over BackOffice,Employee: OIDC4VCI Credential Endpoint
    Note over Portal,CredentialIssuer: Post http://localhost:3002/requestVC
    Portal->>CredentialIssuer: 7. Credential Request with Auth token and proofs
    CredentialIssuer->>CredentialIssuer: 8. Builds & Signs VC
    CredentialIssuer->>Portal: 9. Sends VC to Portal
    Portal->>Wallet: 10. Stores the VC

```




