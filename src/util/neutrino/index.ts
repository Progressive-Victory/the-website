import { NeutrinoClient } from './neutrino-client'

const NEUTRINO_USERID = process.env.NEUTRINO_USERID
const NEUTRINO_SECRET = process.env.NEUTRINO_SECRET

if (!NEUTRINO_USERID)
    throw Error("Please specify 'NEUTRINO_USERID' in the environment file.")
if (!NEUTRINO_SECRET)
    throw Error("Please specify 'NEUTRINO_SECRET' in the environment file.")

export const neutrino = new NeutrinoClient(NEUTRINO_USERID, NEUTRINO_SECRET)
