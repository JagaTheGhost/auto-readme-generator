import { useState } from 'react'

const TECH_STACK_OPTIONS = [
  // Frontend
  { id: 'react', label: 'React', category: 'Frontend' },
  { id: 'nextjs', label: 'Next.js', category: 'Frontend' },
  { id: 'vue', label: 'Vue', category: 'Frontend' },
  { id: 'angular', label: 'Angular', category: 'Frontend' },
  { id: 'svelte', label: 'Svelte', category: 'Frontend' },
  { id: 'typescript', label: 'TypeScript', category: 'Frontend' },
  { id: 'tailwind', label: 'Tailwind CSS', category: 'Frontend' },
  { id: 'vite', label: 'Vite', category: 'Frontend' },
  { id: 'webpack', label: 'Webpack', category: 'Frontend' },
  { id: 'remix', label: 'Remix', category: 'Frontend' },

  // Backend
  { id: 'node', label: 'Node.js', category: 'Backend' },
  { id: 'fastapi', label: 'FastAPI', category: 'Backend' },
  { id: 'flask', label: 'Flask', category: 'Backend' },
  { id: 'django', label: 'Django', category: 'Backend' },
  { id: 'golang', label: 'Go', category: 'Backend' },
  { id: 'rust', label: 'Rust', category: 'Backend' },
  { id: 'java', label: 'Java/Spring', category: 'Backend' },
  { id: 'dotnet', label: '.NET/C#', category: 'Backend' },
  { id: 'python', label: 'Python', category: 'Backend' },
  { id: 'php', label: 'PHP/Laravel', category: 'Backend' },

  // Database
  { id: 'mongodb', label: 'MongoDB', category: 'Database' },
  { id: 'mysql', label: 'MySQL', category: 'Database' },
  { id: 'postgresql', label: 'PostgreSQL', category: 'Database' },
  { id: 'sqlite', label: 'SQLite', category: 'Database' },
  { id: 'redis', label: 'Redis', category: 'Database' },
  { id: 'dynamodb', label: 'DynamoDB', category: 'Database' },
  { id: 'firestore', label: 'Firestore', category: 'Database' },
  { id: 'elasticsearch', label: 'Elasticsearch', category: 'Database' },

  // DevOps/Cloud
  { id: 'docker', label: 'Docker', category: 'DevOps' },
  { id: 'kubernetes', label: 'Kubernetes', category: 'DevOps' },
  { id: 'aws', label: 'AWS', category: 'DevOps' },
  { id: 'gcp', label: 'Google Cloud', category: 'DevOps' },
  { id: 'azure', label: 'Azure', category: 'DevOps' },
  { id: 'vercel', label: 'Vercel', category: 'DevOps' },
  { id: 'netlify', label: 'Netlify', category: 'DevOps' },
  { id: 'heroku', label: 'Heroku', category: 'DevOps' },
  { id: 'github-actions', label: 'GitHub Actions', category: 'DevOps' },
  { id: 'jenkins', label: 'Jenkins', category: 'DevOps' },

  // Testing & Tools
  { id: 'jest', label: 'Jest', category: 'Testing' },
  { id: 'pytest', label: 'Pytest', category: 'Testing' },
  { id: 'cypress', label: 'Cypress', category: 'Testing' },
  { id: 'postman', label: 'Postman', category: 'Testing' },
  { id: 'git', label: 'Git', category: 'Tools' },
  { id: 'graphql', label: 'GraphQL', category: 'Tools' },
  { id: 'rest', label: 'REST API', category: 'Tools' },
]

export default function Input({ onGenerate, loading }) {
  const [repoUrl, setRepoUrl] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTechs, setSelectedTechs] = useState([])
  const [customTech, setCustomTech] = useState('')

  const handleTechChange = (tech) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  const handleAddCustomTech = () => {
    if (customTech.trim() && !selectedTechs.includes(customTech.trim())) {
      setSelectedTechs((prev) => [...prev, customTech.trim()])
      setCustomTech('')
    }
  }

  const handleRemoveCustomTech = (tech) => {
    const isCustom = !TECH_STACK_OPTIONS.some((t) => t.label === tech)
    if (isCustom) {
      setSelectedTechs((prev) => prev.filter((t) => t !== tech))
    } else {
      handleTechChange(tech)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate(repoUrl, description, selectedTechs)
  }

  const categories = [...new Set(TECH_STACK_OPTIONS.map((t) => t.category))]

  return (
    <section className="input-section">
      <form onSubmit={handleSubmit} className="form">
        {/* GitHub URL Input */}
        <div className="form-group">
          <label htmlFor="repo-url">GitHub Repository URL (optional)</label>
          <input
            id="repo-url"
            type="url"
            placeholder="https://github.com/username/repository"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={loading}
          />
          <small>Paste the URL to your GitHub repository</small>
        </div>

        {/* Description Textarea */}
        <div className="form-group">
          <label htmlFor="description">Project Description (optional)</label>
          <textarea
            id="description"
            placeholder="Describe your project in a few sentences... e.g., 'A web app that generates README files automatically using AI'"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={loading}
          />
          <small>Or describe what your project does</small>
        </div>

        {/* Tech Stack Checkboxes */}
        <div className="form-group">
          <label>Tech Stack (optional)</label>
          <div className="tech-stack-container">
            <div className="tech-stack-grid">
              {categories.map((category) => (
                <div key={category} className="tech-category">
                  <h4>{category}</h4>
                  {TECH_STACK_OPTIONS.filter((t) => t.category === category).map(
                    (tech) => (
                      <label key={tech.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedTechs.includes(tech.label)}
                          onChange={() => handleTechChange(tech.label)}
                          disabled={loading}
                        />
                        <span>{tech.label}</span>
                      </label>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Tech Stack Input */}
          <div className="custom-tech-section">
            <div className="custom-tech-input-group">
              <input
                type="text"
                placeholder="Add custom tech (e.g., 'Oracle DB', 'Microservices')"
                value={customTech}
                onChange={(e) => setCustomTech(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomTech()
                  }
                }}
                disabled={loading}
                maxLength={30}
              />
              <button
                type="button"
                className="btn-add-tech"
                onClick={handleAddCustomTech}
                disabled={loading || !customTech.trim()}
              >
                + Add
              </button>
            </div>

            {/* Display Selected Tech (including custom) */}
            {selectedTechs.length > 0 && (
              <div className="selected-techs">
                <label className="selected-label">Selected Technologies ({selectedTechs.length}):</label>
                <div className="tech-badges">
                  {selectedTechs.map((tech) => {
                    const isCustom = !TECH_STACK_OPTIONS.some((t) => t.label === tech)
                    return (
                      <div key={tech} className={`tech-badge ${isCustom ? 'custom' : 'predefined'}`}>
                        <span>{tech}</span>
                        <button
                          type="button"
                          className="remove-badge"
                          onClick={() => handleRemoveCustomTech(tech)}
                          title="Remove"
                          disabled={loading}
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          <small>Select from predefined options or add your own technologies</small>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Generating...' : '✨ Generate README'}
        </button>
      </form>

      {/* Info Box */}
      <div className="info-box">
        <p>
            <strong>Important NOTE: </strong> <br />
            <strong>./</strong> Using this tool is used to generate a <strong>skeleton README file</strong>, so that you does not have to start from scratch. <br/>
            <strong>./</strong> It is not meant to be a complete README generator, and may not include all the sections you need. You can always edit the generated README to add more details, sections, or customize it to your liking.<br />
            <strong>./</strong> The generated README is a starting point. Always review and customize it to ensure it accurately represents your project and includes all necessary information.<br/>
        </p>
        <p>
            <br/>
          <strong>Tip:</strong> Provide either a GitHub URL or a description (or both!) and
          we'll generate a professional README for you.
        </p>
      </div>
    </section>
  )
}
