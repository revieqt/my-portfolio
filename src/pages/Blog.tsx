function Blog() {
  const posts = [
    {
      title: "Building My Developer Portfolio",
      description:
        "A look at how I'm designing and building my personal portfolio.",
      date: "October 2026",
    },
    {
      title: "What I Learned Building a React Native App",
      description:
        "Lessons learned while developing a cross-platform mobile application.",
      date: "September 2026",
    },
  ];

  return (
    <section>
      <header>
        <p>Articles & Thoughts</p>
        <h1>Blog</h1>

        <p>
          I write about software development, projects, technologies, and
          things I'm learning along the way.
        </p>
      </header>

      <div>
        {posts.map((post) => (
          <article key={post.title}>
            <p>{post.date}</p>

            <h2>{post.title}</h2>

            <p>{post.description}</p>

            <a href="#">Read More</a>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Blog;