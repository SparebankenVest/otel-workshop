type Post = {
  id: string;
  title: string;
};

export default async function Posts() {
    const data = await fetch('https://api.vercel.app/blog')
    const posts = await data.json()
    return (
      <ul>
        {posts.map((post: Post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    )
  }