/**
 * Unit tests for the Header component.
 *
 * The Header renders the .story-box with headline, subhead, methodology,
 * source links, and an optional "Pillar Information" button.
 * It is shown only for overview/partners views (hidden for pillar views).
 */
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Header from '$lib/components/layout/Header.svelte';

describe('Header component', () => {
  // ─── Visibility ─────────────────────────────────────────────────────────────
  describe('visibility', () => {
    it('renders content when visible=true', () => {
      const { getByText } = render(Header, {
        props: { headline: 'Test Headline', subhead: 'Test Subhead', visible: true }
      });
      expect(getByText('Test Headline')).toBeInTheDocument();
      expect(getByText('Test Subhead')).toBeInTheDocument();
    });

    it('sets display:flex on .story-box when visible=true', () => {
      const { container } = render(Header, {
        props: { headline: 'Test', visible: true }
      });
      const box = container.querySelector('.story-box') as HTMLElement;
      expect(box.style.display).toBe('flex');
    });

    it('sets display:none on .story-box when visible=false', () => {
      const { container } = render(Header, {
        props: { headline: 'Test', visible: false }
      });
      const box = container.querySelector('.story-box') as HTMLElement;
      expect(box.style.display).toBe('none');
    });

    it('is visible by default (no visible prop needed)', () => {
      const { container } = render(Header, { props: { headline: 'Test' } });
      const box = container.querySelector('.story-box') as HTMLElement;
      expect(box.style.display).toBe('flex');
    });
  });

  // ─── Content ────────────────────────────────────────────────────────────────
  describe('content', () => {
    it('renders the headline', () => {
      const { getByRole } = render(Header, {
        props: { headline: 'Cooling Emissions Will Triple' }
      });
      expect(getByRole('heading', { level: 1 })).toHaveTextContent('Cooling Emissions Will Triple');
    });

    it('renders the subhead', () => {
      const { getByText } = render(Header, {
        props: { subhead: 'AC alone will emit more than aviation by 2035' }
      });
      expect(getByText('AC alone will emit more than aviation by 2035')).toBeInTheDocument();
    });

    it('renders the methodology section when methodology is provided', () => {
      const { container, getByText } = render(Header, {
        props: { methodology: 'Three-layer DECARB: HEAT + CLASP + IEA STEPS' }
      });
      expect(container.querySelector('.story-methodology')).toBeInTheDocument();
      expect(getByText(/DECARB/)).toBeInTheDocument();
    });

    it('does NOT render .story-methodology when methodology is empty', () => {
      const { container } = render(Header, {
        props: { methodology: '' }
      });
      expect(container.querySelector('.story-methodology')).not.toBeInTheDocument();
    });

    it('renders source links inside .story-methodology', () => {
      const { getByRole } = render(Header, {
        props: {
          methodology: 'Some methodology',
          sources: [
            { name: 'HEAT GmbH', url: 'https://www.heat-gmbh.de' },
            { name: 'CLASP', url: 'https://www.clasp.ngo' }
          ]
        }
      });
      expect(getByRole('link', { name: 'HEAT GmbH' })).toHaveAttribute(
        'href',
        'https://www.heat-gmbh.de'
      );
      expect(getByRole('link', { name: 'CLASP' })).toHaveAttribute('href', 'https://www.clasp.ngo');
    });

    it('source links open in a new tab with rel=noopener', () => {
      const { getByRole } = render(Header, {
        props: {
          methodology: 'Some methodology',
          sources: [{ name: 'IEA', url: 'https://www.iea.org' }]
        }
      });
      const link = getByRole('link', { name: 'IEA' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('uses default headline when none is provided', () => {
      const { getByRole } = render(Header);
      expect(getByRole('heading', { level: 1 })).toHaveTextContent('Why Cooling Matters');
    });
  });

  // ─── Pillar Information button ────────────────────────────────────────────
  describe('Pillar Information button', () => {
    it('shows the button when showPillarInfo=true', () => {
      const { getByRole } = render(Header, {
        props: { headline: 'Test', showPillarInfo: true }
      });
      expect(getByRole('button', { name: /Pillar Information/i })).toBeInTheDocument();
    });

    it('hides the button when showPillarInfo=false', () => {
      const { queryByRole } = render(Header, {
        props: { headline: 'Test', showPillarInfo: false }
      });
      expect(queryByRole('button', { name: /Pillar Information/i })).not.toBeInTheDocument();
    });

    it('calls onPillarInfoClick when button is clicked', async () => {
      const handler = vi.fn();
      const { getByRole } = render(Header, {
        props: { headline: 'Test', showPillarInfo: true, onPillarInfoClick: handler }
      });
      await fireEvent.click(getByRole('button', { name: /Pillar Information/i }));
      expect(handler).toHaveBeenCalledOnce();
    });

    it('does NOT call onPillarInfoClick unless clicked', () => {
      const handler = vi.fn();
      render(Header, {
        props: { headline: 'Test', showPillarInfo: true, onPillarInfoClick: handler }
      });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ─── DOM structure ────────────────────────────────────────────────────────
  describe('DOM structure', () => {
    it('always renders a .story-box element', () => {
      const { container } = render(Header, { props: { headline: 'Test' } });
      expect(container.querySelector('.story-box')).toBeInTheDocument();
    });

    it('renders .story-content and .story-meta divs', () => {
      const { container } = render(Header, { props: { headline: 'Test' } });
      expect(container.querySelector('.story-content')).toBeInTheDocument();
      expect(container.querySelector('.story-meta')).toBeInTheDocument();
    });

    it('renders #last-updated element', () => {
      const { container } = render(Header, { props: { headline: 'Test' } });
      expect(container.querySelector('#last-updated')).toBeInTheDocument();
    });
  });
});
