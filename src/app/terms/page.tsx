
export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
          Terms of Service
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
      <div className="prose prose-lg mx-auto text-muted-foreground max-w-none space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">1. Terms</h2>
          <p>By accessing the website at learnandshop.com, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on Learn & Shop's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">3. Disclaimer</h2>
          <p>The materials on Learn & Shop's website are provided on an 'as is' basis. Learn & Shop makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">4. Limitations</h2>
          <p>In no event shall Learn & Shop or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Learn & Shop's website.</p>
        </div>
         <div>
          <h2 className="text-2xl font-semibold text-foreground">5. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction of the website owner's location and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
        </div>
      </div>
    </div>
  );
}
