const jose = require("jose");
const jsonld = require("jsonld");
const { createHash } = require("crypto");
const fs = require("fs");
const forge = require("node-forge");
require('dotenv').config();

const normalize = async (doc) => {
  try {
    const canonized =  jsonld.canonize(doc, {
      algorithm: "URDNA2015",
      format: "application/n-quads",
      safe: false,
      base: null,
    });
    if (canonized === "") throw new Error();

    return canonized;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const keyToPKCS8 = () => {
  // const plainTextKey = fs.readFileSync(process.env.PRIVATE_KEY, "utf8");
  const privateKey = forge.pki.privateKeyFromPem(process.env.PRIVATE_KEY);
 
  const privateKeyforged = forge.pki.privateKeyToAsn1(privateKey);
  
  const privateKeyInfo = forge.pki.wrapRsaPrivateKey(privateKeyforged);
  
  const pem = forge.pki.privateKeyInfoToPem(privateKeyInfo);
  
  return pem;
};
const sign = async (hash) => {
  const alg = "PS256";
  const rsaPrivateKey = await jose.importPKCS8(keyToPKCS8(), alg);
  
  const jws = await new jose.CompactSign(new TextEncoder().encode(hash))
    .setProtectedHeader({ alg, b64: false, crit: ["b64"] })
    .sign(rsaPrivateKey);
    console.log(jws)
  return jws;
};


const sha256 = (input) => {
  return createHash("sha256").update(input).digest("hex");
};


function formatDate(date) {
  function pad(n) {
    return n < 10 ? '0' + n : n.toString();
  }

  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  const ms = date.getMilliseconds();
  const timeZoneOffset = -date.getTimezoneOffset();
  const sign = timeZoneOffset >= 0 ? '+' : '-';
  const timeZone = pad(Math.abs(timeZoneOffset) / 60) + ':' + pad(Math.abs(timeZoneOffset) % 60);

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.${ms}${sign}${timeZone}`;
}

const sign_VC = async (employeeObject) => {

  let uid = sha256((Math.random() + 1).toString(36).substring(7));

  let SD_template = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      `https://registry.lab.gaia-x.eu/development/api/trusted-schemas-registry/v2/schemas`,
    ],
    type: ["VerifiableCredential", "EmployeeCredential"],
    id: `${employeeObject['@id']}`,
    issuer: "did:web:abc-federation.gaia-x.community",
    issuanceDate: formatDate(new Date()),
    expirationDate : formatDate(new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000)),
    credentialSubject: employeeObject
  };

  delete SD_template.proof
  const normalizedSD = await normalize(SD_template)
  const hash = sha256(normalizedSD)
  const jws = await sign(hash)
  
  SD_template.proof = {
      type: "JsonWebSignature2020",
    created: new Date().toISOString(),
    proofPurpose: "assertionMethod",
    verificationMethod: "did:web:abc-federation.gaia-x.community",
    jws: jws
  }
  console.log(SD_template)
  return SD_template
}

module.exports = {
  sign_VC,
};
