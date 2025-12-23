/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next';
import SeoArticleLayout from '@/components/SeoArticleLayout';

export const metadata: Metadata = {
  title: 'WCAG 2.1 AA Requirements: Complete Compliance Guide',
  description: 'Comprehensive guide to WCAG 2.1 Level AA success criteria. Understand what each requirement means and how to implement accessible web design for compliance.',
};

export default function Wcag21AaRequirements() {
  return (
    <SeoArticleLayout title="WCAG 2.1 AA Requirements: Complete Compliance Guide">
      <p>
        The Web Content Accessibility Guidelines (WCAG) 2.1 Level AA represents the internationally recognized standard
        for web accessibility. Organizations worldwide—from government agencies to private enterprises—adopt these
        requirements to ensure their digital properties serve all users, regardless of disability. Understanding what
        WCAG 2.1 AA actually requires is the first step toward building truly inclusive web experiences.
      </p>
      <p>
        This guide breaks down every WCAG 2.1 Level AA success criterion into practical terms. Whether you are a
        developer implementing accessible components, a designer creating inclusive interfaces, or a compliance officer
        ensuring regulatory adherence, this comprehensive reference clarifies exactly what you must do to meet the standard.
      </p>

      <h2>Understanding WCAG 2.1 Structure and Levels</h2>
      <p>
        WCAG 2.1 organizes accessibility requirements into four fundamental principles known by the acronym POUR:
        Perceivable, Operable, Understandable, and Robust. Under these principles sit 13 guidelines, which further
        break down into specific success criteria. Each success criterion is assigned a conformance level: A (minimum),
        AA (mid-range), or AAA (highest).
      </p>
      <p>
        Level AA conformance has become the de facto global standard. It addresses the most significant barriers to
        access without requiring the extensive resources often needed for Level AAA. Major accessibility laws including
        the Americans with Disabilities Act (ADA), Section 508, European Accessibility Act, and Canadian Accessibility
        for Ontarians with Disabilities Act (AODA) all reference WCAG 2.1 Level AA as their baseline requirement.
      </p>
      <p>
        To claim WCAG 2.1 Level AA conformance, you must satisfy all Level A criteria plus all Level AA criteria across
        your entire website or application. Partial compliance does not meet the standard. This comprehensive approach
        ensures consistent accessibility throughout the user journey.
      </p>

      <h2>Perceivable Requirements: Information and User Interface</h2>
      <p>
        The Perceivable principle ensures users can perceive information through at least one of their senses. This
        addresses needs of blind users, low vision users, deaf and hard of hearing users, and those with color vision
        deficiencies.
      </p>

      <h3>Text Alternatives (1.1.1 - Level A)</h3>
      <p>
        Every non-text element must have a text alternative that serves the equivalent purpose. Images need descriptive
        alt attributes. Complex graphics like charts require detailed descriptions. Form inputs need associated labels.
        Video and audio content requires transcripts or captions. Decorative images should have null alt text
        (alt=&quot;&quot;) so screen readers skip them appropriately.
      </p>

      <h3>Captions and Audio Descriptions (1.2.4, 1.2.5 - Level AA)</h3>
      <p>
        All prerecorded video with audio must include synchronized captions. This serves deaf and hard of hearing users
        but also benefits anyone in sound-sensitive environments. Prerecorded video must also provide audio descriptions
        or a media alternative that describes important visual information not conveyed through the main audio track.
        This ensures blind users receive equivalent information.
      </p>

      <h3>Adaptable Content Structure (1.3.1, 1.3.2 - Level A)</h3>
      <p>
        Information, structure, and relationships conveyed through presentation must be programmatically determinable.
        Use proper semantic HTML: actual headings (h1-h6) rather than styled paragraphs, lists (ul, ol) for list content,
        and table markup with proper headers for tabular data. The reading sequence must be meaningful when linearized,
        ensuring screen reader users encounter content in logical order.
      </p>

      <h3>Sensory Characteristics (1.3.3 - Level A)</h3>
      <p>
        Instructions cannot rely solely on sensory characteristics like shape, size, visual location, orientation, or
        sound. Avoid instructions like "click the round button" or "use the controls on the right." Instead, reference
        specific labels: "click the Submit button" or "use the Account Settings controls."
      </p>

      <h3>Orientation (1.3.4 - Level AA)</h3>
      <p>
        Content must not restrict viewing and operation to a single display orientation (portrait or landscape) unless
        that orientation is essential. Users with mounted devices need flexibility to view content in their preferred
        orientation.
      </p>

      <h3>Contrast Requirements (1.4.3 - Level AA)</h3>
      <p>
        Visual presentation of text and images of text must have a contrast ratio of at least 4.5:1. Large text (18pt
        regular or 14pt bold and larger) requires a minimum 3:1 ratio. This ensures readability for users with low
        vision, color blindness, or viewing screens in bright conditions. Logos and decorative text are exempt.
      </p>

      <h3>Text Resizing (1.4.4 - Level AA)</h3>
      <p>
        Text must be resizable up to 200% without assistive technology and without loss of content or functionality.
        Users should not need to scroll horizontally to read lines of text. This requirement supports users with low
        vision who need larger text sizes.
      </p>

      <h3>Images of Text (1.4.5 - Level AA)</h3>
      <p>
        Use actual text rather than images of text wherever possible. Text is infinitely scalable, can be customized by
        users, and works with assistive technologies. Images of text are only acceptable when the visual presentation is
        essential (logos) or when the text can be visually customized to the user's requirements.
      </p>

      <h3>Reflow (1.4.10 - Level AA)</h3>
      <p>
        Content must reflow to a single column at 320 CSS pixels width without requiring horizontal scrolling or loss
        of information. This supports users who zoom pages up to 400% and users of mobile devices. Exceptions exist for
        content requiring two-dimensional layout like maps or data tables.
      </p>

      <h3>Non-Text Contrast (1.4.11 - Level AA)</h3>
      <p>
        User interface components and graphical objects must have a contrast ratio of at least 3:1 against adjacent
        colors. This includes form input borders, focus indicators, icons, and graph elements. The requirement ensures
        these critical interface elements remain visible to users with low vision.
      </p>

      <h3>Text Spacing (1.4.12 - Level AA)</h3>
      <p>
        Content must not lose information or functionality when users adjust text spacing. Specifically, users must be
        able to set line height to at least 1.5 times the font size, paragraph spacing to at least 2 times the font
        size, letter spacing to at least 0.12 times the font size, and word spacing to at least 0.16 times the font
        size without breaking layouts.
      </p>

      <h3>Content on Hover or Focus (1.4.13 - Level AA)</h3>
      <p>
        Additional content appearing on pointer hover or keyboard focus must be dismissible (users can close it without
        moving focus), hoverable (users can move the pointer over the new content), and persistent (it does not
        disappear automatically unless invalid or user dismisses it). This prevents critical information from
        disappearing before users can perceive it.
      </p>

      <h2>Operable Requirements: User Interface and Navigation</h2>
      <p>
        The Operable principle ensures all users can interact with interface components and navigate content. This
        primarily addresses needs of keyboard users, motor disability users, and those requiring more time to complete actions.
      </p>

      <h3>Keyboard Accessibility (2.1.1, 2.1.2 - Level A)</h3>
      <p>
        All functionality must be operable through a keyboard interface without requiring specific timings for individual
        keystrokes. Users must be able to move keyboard focus away from any component using standard navigation. This
        ensures users who cannot use a mouse can still access all features.
      </p>

      <h3>No Keyboard Trap (2.1.4 - Level A)</h3>
      <p>
        Keyboard focus must never become trapped in any component. If focus can move to a component using keyboard, it
        must be possible to move focus away using only keyboard. This prevents keyboard users from becoming stuck.
      </p>

      <h3>Timing Adjustable (2.2.1 - Level A)</h3>
      <p>
        When time limits exist, users must be able to turn off, adjust, or extend them before time expires. Exceptions
        exist for real-time events and essential time limits. This supports users who need more time to read or interact
        with content due to disabilities.
      </p>

      <h3>Pause, Stop, Hide (2.2.2 - Level A)</h3>
      <p>
        Moving, blinking, scrolling, or auto-updating information that starts automatically, lasts more than five seconds,
        and is presented alongside other content must have a mechanism for users to pause, stop, or hide it. This
        prevents distractions for users with attention or reading disabilities.
      </p>

      <h3>Three Flashes or Below Threshold (2.3.1 - Level A)</h3>
      <p>
        Content must not flash more than three times per second, or flashing must be below general flash and red flash
        thresholds. This prevents triggering seizures in users with photosensitive epilepsy.
      </p>

      <h3>Bypass Blocks (2.4.1 - Level A)</h3>
      <p>
        A mechanism must exist to bypass blocks of content repeated on multiple pages, such as navigation menus or
        headers. Skip links allow keyboard users to jump directly to main content without tabbing through dozens of
        navigation links on every page.
      </p>

      <h3>Page Titled (2.4.2 - Level A)</h3>
      <p>
        Every web page must have a descriptive title that identifies the topic or purpose. Page titles appear in browser
        tabs, bookmarks, and search results. They help all users, especially screen reader users, understand what page
        they are on.
      </p>

      <h3>Focus Order (2.4.3 - Level A)</h3>
      <p>
        When users navigate sequentially through content, focus order must be logical and preserve meaning and
        operability. Tab order should follow the visual layout and content structure, ensuring keyboard navigation makes sense.
      </p>

      <h3>Link Purpose in Context (2.4.4 - Level A)</h3>
      <p>
        The purpose of each link must be determinable from the link text alone or from link text together with its
        programmatically determined link context. Avoid generic link text like "click here" or "read more" without
        sufficient context.
      </p>

      <h3>Multiple Ways (2.4.5 - Level AA)</h3>
      <p>
        More than one way must be available to locate a page within a set of web pages, except where the page is the
        result of a process or a step in a process. Common approaches include site search, site map, and table of
        contents. This supports diverse navigation preferences and finding strategies.
      </p>

      <h3>Headings and Labels (2.4.6 - Level AA)</h3>
      <p>
        Headings and labels must describe topic or purpose. Descriptive headings help users understand content
        organization. Clear labels help users understand what information to enter in form fields. Both improve
        navigation and comprehension for all users.
      </p>

      <h3>Focus Visible (2.4.7 - Level AA)</h3>
      <p>
        Any keyboard operable interface must have a mode of operation where the keyboard focus indicator is visible.
        Users must be able to see which element currently has focus. Never remove focus outlines without providing an
        equally visible alternative indicator.
      </p>

      <h3>Pointer Gestures (2.5.1 - Level A)</h3>
      <p>
        All functionality using multipoint or path-based gestures must also be operable with a single pointer without
        requiring a path-based gesture, unless essential. Pinch-zoom, two-finger swipes, and complex gestures must have
        single-pointer alternatives like buttons.
      </p>

      <h3>Pointer Cancellation (2.5.2 - Level A)</h3>
      <p>
        For functionality operated using a single pointer, the down-event must not execute any function. Functions should
        execute on the up-event, and users must be able to abort or undo actions. This prevents accidental activation
        from tremors or imprecise pointing.
      </p>

      <h3>Label in Name (2.5.3 - Level A)</h3>
      <p>
        For user interface components with labels that include text or images of text, the accessible name must contain
        the visible text. This ensures voice control users can activate controls by speaking the visible label.
      </p>

      <h3>Motion Actuation (2.5.4 - Level A)</h3>
      <p>
        Functionality triggered by device motion or user motion must also be operable through user interface components,
        and there must be a way to disable motion activation. Shake-to-undo or tilt-to-scroll features need alternatives
        and disable options.
      </p>

      <h2>Understandable Requirements: Information and User Interface Operation</h2>
      <p>
        The Understandable principle ensures information and interface operation is comprehensible to all users,
        regardless of cognitive abilities, language proficiency, or familiarity with conventions.
      </p>

      <h3>Language of Page (3.1.1 - Level A)</h3>
      <p>
        The default human language of each web page must be programmatically determinable using the lang attribute on
        the html element. This allows screen readers to use the correct pronunciation rules and braille translation
        tables.
      </p>

      <h3>Language of Parts (3.1.2 - Level AA)</h3>
      <p>
        The human language of each passage or phrase in the content must be programmatically determinable, except for
        proper names, technical terms, and words of indeterminate language. Use lang attributes on elements containing
        text in different languages so assistive technologies pronounce them correctly.
      </p>

      <h3>On Focus (3.2.1 - Level A)</h3>
      <p>
        Receiving focus must not initiate a change of context. When users tab to a component, it should not automatically
        submit forms, change page content substantially, or navigate away. Users need predictable behavior to understand
        interfaces.
      </p>

      <h3>On Input (3.2.2 - Level A)</h3>
      <p>
        Changing the setting of a user interface component must not automatically cause a change of context unless the
        user has been advised beforehand. Selecting a radio button or choosing a dropdown option should not automatically
        submit forms or navigate to new pages without explicit user action or prior warning.
      </p>

      <h3>Consistent Navigation (3.2.3 - Level AA)</h3>
      <p>
        Navigation mechanisms repeated on multiple pages must occur in the same relative order each time, unless a user
        initiates a change. This predictability helps users learn where to find navigation controls and reduces cognitive load.
      </p>

      <h3>Consistent Identification (3.2.4 - Level AA)</h3>
      <p>
        Components with the same functionality must be identified consistently across pages. If a search icon appears
        throughout your site, it should always use the same icon and label. Consistency reduces confusion and improves learnability.
      </p>

      <h3>Error Identification (3.3.1 - Level A)</h3>
      <p>
        When input errors are automatically detected, the item in error must be identified and described to the user in
        text. Error messages should be specific: "Email address is required" rather than "Error in form."
      </p>

      <h3>Labels or Instructions (3.3.2 - Level A)</h3>
      <p>
        Labels or instructions must be provided when content requires user input. Users should understand what
        information to enter and in what format. Required fields should be clearly indicated.
      </p>

      <h3>Error Suggestion (3.3.3 - Level AA)</h3>
      <p>
        When input errors are automatically detected and suggestions for correction are known, provide those suggestions
        to users unless doing so would jeopardize security or purpose. Help users fix mistakes by suggesting valid formats
        or corrected values.
      </p>

      <h3>Error Prevention (3.3.4 - Level AA)</h3>
      <p>
        For pages causing legal commitments, financial transactions, data modifications, or test submissions, at least
        one of these must be true: submissions are reversible, data is checked for errors and users can correct them, or
        a confirmation mechanism reviews and confirms information before submission. This prevents costly mistakes.
      </p>

      <h2>Robust Requirements: Content Compatibility</h2>
      <p>
        The Robust principle ensures content works reliably across diverse user agents, including assistive technologies
        like screen readers, voice control software, and alternative input devices.
      </p>

      <h3>Parsing (4.1.1 - Level A)</h3>
      <p>
        Content implemented using markup languages must have complete start and end tags, be nested according to
        specifications, not contain duplicate attributes, and have unique IDs except where specifications allow otherwise.
        Valid HTML ensures consistent rendering across browsers and assistive technologies.
      </p>

      <h3>Name, Role, Value (4.1.2 - Level A)</h3>
      <p>
        For all user interface components, the name and role can be programmatically determined, states and properties
        can be programmatically set, and notification of changes is available to user agents including assistive
        technologies. Use semantic HTML or proper ARIA attributes to ensure assistive technologies understand your
        custom components.
      </p>

      <h3>Status Messages (4.1.3 - Level AA)</h3>
      <p>
        Status messages must be programmatically determinable through role or properties so assistive technologies can
        present them to users without receiving focus. Use ARIA live regions for dynamic content updates like "Item
        added to cart" or "5 results found" so screen reader users receive these notifications without interrupting their
        current task.
      </p>

      <h2>Implementing WCAG 2.1 AA Compliance</h2>
      <p>
        Understanding requirements is only the beginning. Implementation requires systematic testing and remediation.
        Start by running an automated accessibility audit to identify obvious violations.{' '}
        <a href="https://scan.vexnexa.com">VexNexA provides free WCAG 2.1 AA scans</a> that analyze your site against
        these exact requirements, delivering a detailed report with specific findings and remediation guidance directly
        to your inbox.
      </p>
      <p>
        After addressing automated findings, conduct manual testing. Navigate your site using only a keyboard. Test with
        screen readers like NVDA or VoiceOver. Verify color contrast manually for complex backgrounds. Review form
        workflows for clear error messaging. These manual evaluations catch issues automated tools miss and ensure truly
        accessible user experiences.
      </p>

      <h2>Frequently Asked Questions</h2>

      <h3>What is the difference between WCAG 2.0 and WCAG 2.1?</h3>
      <p>
        WCAG 2.1 extends WCAG 2.0 with 17 additional success criteria addressing mobile accessibility, low vision needs,
        and cognitive disabilities. All WCAG 2.0 criteria remain in 2.1, making it backward compatible. Organizations
        meeting WCAG 2.1 automatically meet WCAG 2.0. Most modern compliance requirements reference WCAG 2.1 specifically.
      </p>

      <h3>Do I need to meet all WCAG 2.1 AA requirements, or can I aim for partial compliance?</h3>
      <p>
        Full conformance requires meeting all Level A and Level AA success criteria across your entire site or defined
        scope. Partial compliance does not qualify as WCAG 2.1 AA conformance. However, improving accessibility
        incrementally still provides value to users even before achieving full conformance. The goal is continuous
        improvement toward complete accessibility.
      </p>

      <h3>How do WCAG 2.1 AA requirements apply to mobile applications?</h3>
      <p>
        WCAG 2.1 applies to web content accessed through mobile browsers. For native mobile applications, the principles
        and many success criteria provide useful guidance, but platform-specific accessibility guidelines (iOS
        Accessibility Guidelines, Android Accessibility Guidelines) offer more directly applicable requirements. Many
        organizations apply WCAG 2.1 AA to both web and mobile for consistency.
      </p>

      <h3>Are PDF documents required to meet WCAG 2.1 AA?</h3>
      <p>
        If your website provides PDF documents as content, those PDFs fall under WCAG requirements and must be accessible.
        This includes tagged PDFs with proper structure, alt text for images, reading order, form field labels, and
        sufficient contrast. Creating accessible PDFs requires specific techniques beyond standard document creation.
      </p>

      <h3>How long does it typically take to achieve WCAG 2.1 AA compliance?</h3>
      <p>
        The timeline varies dramatically based on your site's size, complexity, and current accessibility state. A small,
        recently built site might achieve compliance in weeks. A large, legacy application could require months of
        sustained effort. <a href="https://scan.vexnexa.com">Running an accessibility audit</a> provides clarity on your
        starting point and helps establish realistic timelines based on actual violation counts and severity.
      </p>

      <h2>Moving Forward with Accessibility</h2>
      <p>
        WCAG 2.1 Level AA compliance is achievable with systematic effort and clear understanding of requirements. Each
        success criterion addresses real barriers faced by people with disabilities. Meeting these requirements means
        expanding your audience, reducing legal risk, and doing the right thing.
      </p>
      <p>
        Begin with baseline testing to understand your current state. Prioritize remediation based on severity and user
        impact. Integrate accessibility into your development workflow so future work maintains compliance. Accessibility
        is not a one-time project but an ongoing commitment to inclusive design.
      </p>
      <p>
        Take the first step today. Discover exactly where your website stands against WCAG 2.1 Level AA requirements with
        a comprehensive accessibility scan. Understanding your starting point is essential for planning effective
        improvements and measuring progress toward full compliance.
      </p>
    </SeoArticleLayout>
  );
}
