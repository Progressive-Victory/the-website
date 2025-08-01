import { User } from '@/models/User'
import { auth } from '@/util/auth'
import { HTTPStatus } from '@/util/https-status'
import dbConnect from '@/util/libmongo'
import { neutrino } from '@/util/neutrino'
import { OnboardingStage } from '@/util/stage'
import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  // Parse incoming JSON body
  const reqJson = await req.json()
  if (!reqJson.number) {
    return new Response('Phone number is required', {
      status: HTTPStatus.BadRequest,
    })
  }

  const session = await auth()
    
  if (!session) {
    return new Response('Unauthorized', { status: HTTPStatus.UnAuthorized })
  }

  // Get the user
  try {
    await dbConnect()

    const user = await User.findOne({ discordId: session?.discordId })

    switch (user?.onboardingStage) {
      case OnboardingStage.NOT_STARTED:
        // Update user to await state
        user.onboardingStage = OnboardingStage.AWAIT_VERIFICATION
        await user.save()
        break
      case OnboardingStage.AWAIT_VERIFICATION:
        // Do nothing we can send another code if they need it
        break
      default:
        // They cannot request a code after being verified
        return new Response('Unauthorized', {
          status: HTTPStatus.UnAuthorized,
        })
    }
  } catch {
    return new Response('Unauthorized', { status: HTTPStatus.UnAuthorized })
  }

  const data = await neutrino.smsVerify(reqJson.number, {
    codeLength: 6,
    brandName: 'Progressive Victory',
    limit: 20,
    countryCode: 'US',
  })

  if ('api-error-msg' in data)
    throw Error(data['api-error-msg'])

  if (!data.sent) {
    return new Response('Bad request', { status: HTTPStatus.BadRequest })
  }

  return new Response('Success', { status: HTTPStatus.Ok })
}
