function Contact() {
  return (
    <section>
      <header>
        <p>Let's connect</p>
        <h1>Contact Me</h1>

        <p>
          Have a question, project, or opportunity? I'd love to hear from you.
        </p>
      </header>

      <form>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            placeholder="Your message..."
            rows={6}
            required
          />
        </div>

        <button type="submit">Send Message</button>
      </form>

      <div>
        <h2>Other ways to reach me</h2>

        <a href="https://github.com/" target="_blank" rel="noreferrer">
          GitHub
        </a>

        <a href="https://linkedin.com/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
    </section>
  );
}

export default Contact;