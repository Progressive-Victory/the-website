import Link from 'next/link'
import Image from 'next/image'
import { SocialIcon } from 'react-social-icons'

const socials = [
  'https://www.twitch.tv/progressivevictory',
  'https://www.youtube.com/channel/UCRn-TsfTCP68oee03_F2eIg',
  'https://www.instagram.com/progressivevictory/',
  'https://bsky.app/profile/progressivevictory.win',
  'https://x.com/ProgressiveVic?mx=2',
]

export function Footer() {
  return (
    <div className="w-full bg-black-pearl-dark grid grid-cols-1 lg:grid-cols-3">
      <div className="space-x-4 gap-x-4 m-6 lg:block 3xl:gap-8">
        <div className="flex flex-wrap lg:flex-col items-center justify-center gap-x-4 gap-y-2">
          <Link href="/about">
            <p className="text-white text-lg font-bold hover:underline px-8 text-center">
              About
            </p>
          </Link>
          <Link href="/volunteer">
            <p className="text-white text-lg font-bold hover:underline px-8 text-center">
              Volunteer
            </p>
          </Link>
          <Link href="/events">
            <p className="text-white text-lg font-bold hover:underline px-8 text-center">
              Events
            </p>
          </Link>
          <Link href="https://progressivevictory.myshopify.com/">
            <p className="text-white text-lg font-bold hover:underline px-8 text-center">
              Merch
            </p>
          </Link>
          <Link href="https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform">
            <p className="text-white text-lg font-bold hover:underline px-8 text-center">
              Contact
            </p>
          </Link>
          <Link href="/privacy">
            <p className="text-white text-lg font-bold hover:underline px-8 text-center whitespace-nowrap">
              Privacy Policy
            </p>
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start gap-y-4 gap-x-6 py-6">
        <Image
          src="/images/LogoFull.webp"
          alt="progressive-victory-logo"
          width={256}
          height={256}
        />
        <div className="mx-12 border-2 border-white p-1 text-center font-bold text-steel-blue md:mx-0 md:w-[400px] ">
          PAID FOR BY PROGRESSIVE VICTORY{' '}
          <Link
            href="https://progressivevictory.win"
            className="text-valencia"
          >
            WWW.PROGRESSIVEVICTORY.WIN
          </Link>{' '}
          NOT AUTHORIZED BY ANY CANDIDATE OR CANDIDATE’S COMMITTEE.
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-row sm:flex-wrap 3xl:flex-nowrap items-center justify-center space-x-4 gap-x-4 m-6 3xl:gap-8">
          {socials.map((social) => (
            <SocialIcon key={social} url={social} fgColor="white" />
          ))}
        </div>
        <div className="flex flex-row sm:flex-wrap 3xl:flex-nowrap sm:flex-row space-x-4 gap-x-4 m-6 3xl:gap-8">
          <a target="_blank" className="text-base text-nowrap bg-valencia px-10 py-4 rounded-full text-white font-bold hover:bg-white hover:text-black-pearl-dark transition duration-300 ease-in-out hidden xl:block"
            href="https://secure.actblue.com/donate/pvwebsite">
            Donate
          </a>
          <a target="_blank" className="text-base text-nowrap bg-valencia px-10 py-4 rounded-full text-white font-bold hover:bg-white hover:text-black-pearl-dark transition duration-300 ease-in-out hidden xl:block"
            href="/volunteer">
            Get Involved
          </a>
        </div>
      </div>
    </div>

  )
}
