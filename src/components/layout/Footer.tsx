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
        <div className="w-full bg-black-pearl-dark grid grid-cols-3">
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
                <div className="mx-12 border-2 border-white p-1 text-center font-bold text-steel-blue md:mx-0 md:w-[400px]">
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

            <div className="flex flex-col items-center justify-center gap-y-4 py-6">
            </div>

            <div className="flex flex-col items-end justify-center gap-y-4 py-6 pr-8">
                <div className="flex flex-row items-end justify-end gap-x-8 py-6">
                    <Link href="/about">
                        <p className="text-white text-lg font-bold hover:underline">
                            About
                        </p>
                    </Link>
                    <Link href="/volunteer">
                        <p className="text-white text-lg font-bold hover:underline">
                            Volunteer
                        </p>
                    </Link>
                    <Link href="/events">
                        <p className="text-white text-lg font-bold hover:underline">
                            Events
                        </p>
                    </Link>
                    <Link href="https://progressivevictory.myshopify.com/">
                        <p className="text-white text-lg font-bold hover:underline">
                            Merch
                        </p>
                    </Link>
                </div>
                <div className="flex flex-row items-start justify-stretch gap-x-4 py-6">
                    {socials.map((social) => (
                        <SocialIcon key={social} url={social} fgColor="white" />
                    ))}
                    <a target="_blank" className="text-base bg-valencia px-4 py-2 rounded-full text-white font-bold hover:bg-white hover:text-black-pearl-dark transition duration-300 ease-in-out hidden xl:block" 
                        href="https://secure.actblue.com/donate/pvwebsite">
                            Donate
                    </a>
                    <a target="_blank" className="text-base bg-valencia px-4 py-2 rounded-full text-white font-bold hover:bg-white hover:text-black-pearl-dark transition duration-300 ease-in-out hidden xl:block" 
                        href="/volunteer">
                            Get Involved
                    </a>
                </div>
                <div className="flex flex-row items-end justify-end gap-x-8 py-6">
                    <Link href="https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform">
                        <p className="text-white text-lg font-bold hover:underline">
                            Contact
                        </p>
                    </Link>
                    <Link href="/privacy">
                        <p className="text-white text-lg font-bold hover:underline">
                            Privacy Policy
                        </p>
                    </Link>
                    <Link href="/account">
                        <p className="text-white text-lg font-bold hover:underline">
                            Account
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    )
}
