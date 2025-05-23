import { NeutrinoClient } from "./neutrino-client";

const NEUTRINO_USERID = process.env.NEUTRINO_USERID
const NEUTRINO_SECRET = process.env.NEUTRINO_SECRET

if (!NEUTRINO_USERID) throw Error('Please define the NEUTRINO_USERID environment variable')
if (!NEUTRINO_SECRET) throw Error('Please define the NEUTRINO_SECRET environment variable')

export const Neutrino = new NeutrinoClient(NEUTRINO_USERID, NEUTRINO_SECRET)