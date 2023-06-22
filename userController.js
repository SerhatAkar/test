const axios = require('axios');
const jwt = require('jsonwebtoken');
const VCsignature = require('../services/create_vc');
const keycloakConfig = require('../config/keycloak-config');
const VCconfigurations = require('../../config/VerifiableCredentialsConfiguration.json');
require('dotenv').config();
exports.login = async (req, res) => {
  try {
    if (req.body.type === 'employee') {
      const redirectUri = 'http://localhost:3000'; // replace with your redirect URI
      const keycloakUrl = keycloakConfig.getKeycloakLoginUrl(redirectUri);
      res.status(200).send(keycloakUrl);
    } else {
      throw new Error('Type not supported currently');
    }
  } catch (error) {
    console.log(error);
    res.status(404).json(error.message);
  }
};

const secretKey = "QWf9eHm62P4fQ5IN4+GDEaZJ3YF9vMM85aGkzZtCRsI=";

exports.credential = async (req, res) => {
  try {
    if (!req.body.format || !req.body.types || !req.body.proof) {
      throw new Error('Missing parameter(s)');
    }
    const decodedJWT = jwt.decode(req.body.proof.jwt);
    if (req.body.types[1] === 'employee') {
      const data = {
        name: decodedJWT.name,
        surname: decodedJWT.family_name,
        title: decodedJWT.jobTitle,
        email: decodedJWT.email,
      };
      const VC = await VCsignature.sign_VC(data);
      const oidcReturn = {
        "format" : "JSON",
        "credential" : VC
      }
      console.log(jwt.sign(VC, secretKey))
      res.status(200).json(oidcReturn);
    }
    console.log(decodedJWT);
    console.log(req.body);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

exports.listVCtypes = async (req, res) => {
  const VCNames = Object.keys(VCconfigurations);
  res.json({ listvc: VCNames });
};

exports.VCloginType = async (req, res) => {
  const vcType = req.params.vcType;
  console.log(req);
  if (VCconfigurations[vcType]) {
    res.json(VCconfigurations[vcType]);
  } else {
    res.status(400).json({ error: `VC type '${vcType}' does not exist` });
  }
};
