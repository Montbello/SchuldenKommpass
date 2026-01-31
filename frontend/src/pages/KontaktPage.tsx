import { useState } from 'react';

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    privacy: false,
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In einer echten Anwendung würde hier ein API-Aufruf erfolgen
    console.log('Kontaktformular gesendet:', formData);
    setStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '', privacy: false });
  }

  return (
    <div className="contact-page">
      <h1>Kontakt</h1>

      <div className="contact-container">
        <section className="contact-info">
          <h2>So erreichen Sie uns</h2>
          
          <div className="contact-method">
            <h3>📧 E-Mail</h3>
            <p>
              <a href="mailto:kontakt@schuldenkompass.de">kontakt@schuldenkompass.de</a>
            </p>
          </div>

          <div className="contact-method">
            <h3>📞 Telefon</h3>
            <p>[Telefonnummer einfügen]</p>
            <p className="contact-hours">Mo-Fr: 9:00 - 17:00 Uhr</p>
          </div>

          <div className="contact-method">
            <h3>📍 Adresse</h3>
            <address>
              [Firmenname]<br />
              [Straße und Hausnummer]<br />
              [PLZ] [Ort]
            </address>
          </div>
        </section>

        <section className="contact-form-section">
          <h2>Kontaktformular</h2>
          
          {status === 'success' && (
            <div className="alert alert-success">
              Vielen Dank für Ihre Nachricht! Wir werden uns schnellstmöglich bei Ihnen melden.
            </div>
          )}

          {status === 'error' && (
            <div className="alert alert-error">
              Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-Mail *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Betreff *</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                aria-required="true"
              >
                <option value="">Bitte wählen...</option>
                <option value="general">Allgemeine Anfrage</option>
                <option value="support">Technischer Support</option>
                <option value="feedback">Feedback</option>
                <option value="partnership">Kooperationsanfrage</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Nachricht *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                required
                aria-required="true"
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="privacy"
                  checked={formData.privacy}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
                <span>
                  Ich habe die <a href="/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a> gelesen
                  und bin mit der Verarbeitung meiner Daten einverstanden. *
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary">
              Nachricht senden
            </button>

            <p className="form-hint">* Pflichtfelder</p>
          </form>
        </section>
      </div>
    </div>
  );
}
