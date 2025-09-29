import React from 'react';
import { BlogPost as BlogPostType, ViewState } from '../types'; 
import { ArrowLeftIcon, CalendarDaysIcon, UserCircleIcon, TagIcon, BookOpenIcon } from '../components/Icons';
import RGBBorderWrapper from '../components/RGBBorderWrapper'; // Import the wrapper

interface BlogPostPageProps {
  post: BlogPostType; 
  onNavigate: (view: ViewState, params?: any) => void;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post, onNavigate }) => {

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', options);
  };

  // Enhanced content formatting to handle different markdown-like elements
  const formatContent = (content: string): React.ReactNode[] => {
    const lines = content.split(/\\n|\n/g); // Split by literal '\n' or actual newlines
    const elements: React.ReactNode[] = [];
    let currentListItems: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent = "";

    function flushList() {
        if (currentListItems.length > 0) {
            elements.push(
                <ul key={`list-${elements.length}`} className="list-disc list-outside pl-5 my-3 space-y-1.5 text-slate-300 leading-relaxed">
                    {currentListItems.map((li, idx) => <li key={idx} dangerouslySetInnerHTML={{ __html: li.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-slate-600/70 px-1.5 py-0.5 rounded text-sm text-amber-300 mx-0.5">$1</code>') }} />)}
                </ul>
            );
            currentListItems = [];
        }
    }

    function flushCodeBlock() {
        if (codeBlockContent) {
            // Attempt to remove "text" or "Text" prefix if it's the very start of the code block content
            let finalContent = codeBlockContent.trim();
            if (finalContent.toLowerCase().startsWith('text\n')) {
                finalContent = finalContent.substring(5); // Length of "text\n"
            } else if (finalContent.toLowerCase().startsWith('text ')) {
                 finalContent = finalContent.substring(5); // Length of "text "
            }

            elements.push(
                <pre key={`codeblock-${elements.length}`} className="bg-slate-700/50 p-3 sm:p-4 rounded-md my-4 text-xs sm:text-sm text-slate-200 overflow-x-auto border border-slate-600 shadow-inner whitespace-pre-wrap">
                    <code>{finalContent}</code>
                </pre>
            );
            codeBlockContent = "";
        }
    }
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line.startsWith('```')) {
            flushList(); // End any open list before starting/ending code block
            if (inCodeBlock) {
                // If there's content on the closing ``` line, capture it (though unusual)
                if (line.length > 3) codeBlockContent += line.substring(0, line.lastIndexOf("```")) + '\n';
                flushCodeBlock();
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
                // Capture content on the opening ``` line if any (e.g., ```text)
                // We'll strip common language hints like 'text' in flushCodeBlock
                let contentOnOpenLine = line.substring(3);
                if(contentOnOpenLine) codeBlockContent += contentOnOpenLine + '\n';

            }
            continue;
        }

        if (inCodeBlock) {
            codeBlockContent += lines[i] + '\n'; // Use original line for spacing within code block
            continue;
        }

        // Heading: **Bolded line by itself**
        if (line.startsWith('**') && line.endsWith('**') && !line.includes('**', 2)) {
            flushList();
            elements.push(<h3 key={`h3-${elements.length}`} className="text-xl font-semibold text-sky-300 mt-6 mb-3" dangerouslySetInnerHTML={{ __html: line.substring(2, line.length - 2) }} />);
            continue;
        }

        // List item: * item or - item
        if (line.startsWith('* ') || line.startsWith('- ')) {
            currentListItems.push(line.substring(2));
             // If next line is not a list item or end of content, flush the list
            if (i + 1 >= lines.length || (!lines[i+1].trim().startsWith('* ') && !lines[i+1].trim().startsWith('- '))) {
                flushList();
            }
            continue;
        }
        
        flushList(); // End list if current line is not a list item

        if (line) {
            elements.push(<p key={`p-${elements.length}`} className="mb-4 text-slate-300 leading-relaxed text-base" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-slate-600/70 px-1.5 py-0.5 rounded text-sm text-amber-300 mx-0.5">$1</code>') }} />);
        } else if (elements.length > 0 && !inCodeBlock && currentListItems.length === 0) { // Handle empty lines as paragraph breaks if not in list/code
             // Add a visual break for multiple newlines, but avoid if last element was already a break or similar
            const lastElement = elements[elements.length-1];
            // @ts-ignore
            if (lastElement && lastElement.key && !lastElement.key.toString().startsWith('br-')) {
                 elements.push(<div key={`br-${elements.length}`} className="h-2"></div>);
            }
        }
    }
    flushList(); // Ensure any remaining list is flushed
    flushCodeBlock(); // Ensure any remaining code block is flushed
    return elements;
};


  const IconToRender = post.icon || BookOpenIcon; 


  return (
    <section id={`blog-post-${post.slug}`} className="py-16 md:py-24 bg-slate-900 text-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <button
          onClick={() => onNavigate('blogList')}
          className="inline-flex items-center text-sky-400 hover:text-sky-300 mb-8 group transition-colors"
          aria-label="Voltar para a lista de artigos"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
          Voltar ao Centro de Conhecimento
        </button>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-fuchsia-500 to-amber-400 mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center text-sm text-slate-400 space-x-4 mb-4">
              <span className="flex items-center">
                <UserCircleIcon className="w-5 h-5 mr-1.5 text-slate-500" />
                {post.author}
              </span>
              <span className="flex items-center">
                <CalendarDaysIcon className="w-5 h-5 mr-1.5 text-slate-500" />
                Publicado em {formatDate(post.date)}
              </span>
              {post.category && (
                <span className="flex items-center">
                  <TagIcon className="w-5 h-5 mr-1.5 text-slate-500" />
                  {post.category}
                </span>
              )}
            </div>
            {post.icon && (
              <div className={`w-full h-auto max-h-[250px] flex items-center justify-center rounded-lg shadow-xl mb-6 border-2 border-slate-700 
                              ${post.iconColor ? post.iconColor.replace('text-', 'bg-').replace(/-\d+$/, '-900/20') : 'bg-sky-900/20'} 
                              p-8`}>
                <IconToRender className={`w-28 h-28 sm:w-32 sm:h-32 ${post.iconColor || 'text-sky-400'} opacity-70`} />
              </div>
            )}
          </header>

          <RGBBorderWrapper
            rounded="rounded-lg"
            innerBgColor="bg-slate-800"
            innerPadding="p-6"
            contentClassName="prose prose-base md:prose-lg prose-invert max-w-none"
          >
            {formatContent(post.content)}
          </RGBBorderWrapper>

          {post.tags && post.tags.length > 0 && (
            <footer className="mt-10 pt-6 border-t border-slate-700/50">
              <h4 className="text-md font-semibold text-slate-400 mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => ( 
                  <span key={`${tag}-${index}`} className="text-xs bg-slate-700 text-sky-300 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </footer>
          )}
        </article>
      </div>
    </section>
  );
};

export default BlogPostPage;
