export default async function Page({
  params,
  
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const res = await fetch(`http://progressive-victory-blog.local/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{post(id: "${slug}", idType: SLUG){title, content, date}}`,
    }),
  });
  const data = await res.json();
  const post = data.data.post;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.date}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}
