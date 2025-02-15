export function LoginCard({
    signIn,
    signOut,
}: {
    signIn: (provider: string) => void
    signOut: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow-lg">
            <button
                onClick={() => signIn('discord')}
                className="bg-prussian text-white font-bold py-2 px-4 rounded-full hover:bg-white hover:text-prussian transition duration-300 ease-in-out"
            >
                Sign In
            </button>
            <button
                onClick={signOut}
                className="bg-prussian text-white font-bold py-2 px-4 rounded-full hover:bg-white hover:text-prussian transition duration-300 ease-in-out"
            >
                Sign Out
            </button>
        </div>
    )
}
