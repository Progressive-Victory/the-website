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
    <div className="flex w-full flex-col bg-black-pearl-dark items-center lg:flex-row">
      <div className="m-6 flex flex-col items-center justify-center lg:w-1/5 lg:items-start">
        <Image
          src="/images/LogoFull.webp"
          alt="progressive-victory-logo"
          width={256}
          height={256}
        />
      </div>

      <div className="m-4 flex flex-col items-center justify-start gap-x-6 gap-y-4 lg:w-3/5">
        <div className="flex flex-row items-center justify-center gap-x-4 gap-y-2 lg:w-full">
          <div className="flex flex-row items-center justify-center gap-x-2 space-x-4 sm:flex-wrap 3xl:flex-nowrap 3xl:gap-8">
            {socials.map((social) => (
              <SocialIcon key={social} url={social} fgColor="white" />
            ))}
          </div>
        </div>
      </div>

      <div className="m-6 flex flex-col items-center justify-center lg:w-1/5 lg:items-end">
        <div className="border-2 border-white p-1 text-center text-xs font-bold text-steel-blue md:mx-0 md:w-[300px]">
          PAID FOR BY PROGRESSIVE VICTORY{' '}
          <Link
            href="https://progressivevictory.win"
            className="text-valencia"
          >
            WWW.PROGRESSIVEVICTORY.WIN
          </Link> {' '}
          <div className="">
            NOT AUTHORIZED BY ANY CANDIDATE OR CANDIDATE’S COMMITTEE.
          </div>
        </div>
      </div>
    </div>

  )
}
