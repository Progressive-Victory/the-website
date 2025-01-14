import Link from "next/link";
export function Footer() {
  return (
    <div className="bg-prussian w-full">
      <div className="flex flex-col items-center justify-center gap-y-4 py-12">
        <div className="p-1 border-2 border-white w-[400px] text-center text-steel-blue font-bold">
          PAID FOR BY PROGRESSIVE VICTORY,{" "}
          <Link href="https://progressivevictory.win" className="text-jasper">
            WWW.PROGRESSIVEVICTORY.WIN
          </Link>
          , NOT AUTHORIZED BY ANY CANDIDATE OR CANDIDATE’S COMMITTEE.
        </div>
      </div>
    </div>
  );
}
