export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-4 px-6 text-center">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} Matheus Freitas. All rights reserved.
      </p>
    </footer>
  )
}
