import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Top */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Branding */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              © {new Date().getFullYear()}{" "}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Josh Opsima
              </span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
              Full Stack Developer · Open for opportunities
            </p>
            <button onClick={() => window.open("/resume.pdf", "_blank")}
            className="mt-6 text-center font-mono text-xs text-gray-400 dark:text-gray-500 underline align-middle mx-auto">
              View Resume
            </button>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com/revieqt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="rounded-full p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <FaFacebookF size={18} />
            </a>

            <a
              href="https://instagram.com/jsh.ex3"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full p-2 text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition"
            >
              <FaInstagram size={18} />
            </a>

            <a
              href="https://www.linkedin.com/in/joshua-opsima-09a3a7316/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="rounded-full p-2 text-gray-500 hover:text-blue-700 dark:hover:text-blue-500 transition"
            >
              <FaLinkedinIn size={18} />
            </a>

            <a
              href="https://github.com/revieqt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="rounded-full p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <FaGithub size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
