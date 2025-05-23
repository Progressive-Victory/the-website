import Link from 'next/link'
import { SocialIcon } from 'react-social-icons'
import Image from 'next/image'
const socials = [
    'https://www.twitch.tv/progressivevictory',
    'https://www.youtube.com/channel/UCRn-TsfTCP68oee03_F2eIg',
    'https://www.instagram.com/progressivevictory/',
    'https://bsky.app/profile/progressivevictory.win',
    'https://x.com/ProgressiveVic?mx=2',
]
export function Footer() {
    return (
        <div className="bg-black-pearl-dark w-full">
            <div className="flex flex-col items-center justify-start gap-y-4 py-6">
                <Image
                    src="/images/LogoFull.webp"
                    alt="progressive-victory-logo"
                    width={256}
                    height={256}
                />
                <div className="flex flex-row items-center justify-center gap-x-4">
                    {socials.map((social) => (
                        <SocialIcon key={social} url={social} fgColor="white" />
                    ))}
                </div>
                <div className="p-1 border-2 border-white md:w-[400px] text-center text-steel-blue font-bold mx-12 md:mx-0">
                    PAID FOR BY PROGRESSIVE VICTORY{' '}
                    <Link
                        href="https://progressivevictory.win"
                        className="text-valencia"
                    >
                        WWW.PROGRESSIVEVICTORY.WIN
                    </Link>{' '}
                    NOT AUTHORIZED BY ANY CANDIDATE OR CANDIDATE’S COMMITTEE.
                </div>

                <Link href="/privacy">
                    <p className="text-steel-blue font-bold underline">
                        Privacy Policy
                    </p>
                </Link>
            </div>
        </div>
    )
}
