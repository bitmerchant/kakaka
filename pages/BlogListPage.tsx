
import React from 'react';
import { ViewState, BlogPost as BlogPostType } from '../types'; 
import { BookOpenIcon, CalendarDaysIcon, UserCircleIcon, TagIcon, ArrowRightIcon } from '../components/Icons';

interface BlogListPageProps {
  onNavigate: (view: ViewState, params?: any) => void;
  posts: BlogPostType[]; 
}

const BlogListPage: React.FC<BlogListPageProps> = ({ onNavigate, posts }) => {

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', options);
  };

  return (
    <section id="blog-list" className="py-16 md:py-24 bg-slate-900 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12 md:mb-16">
          <BookOpenIcon className="w-16 h-16 text-sky-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-fuchsia-500 mb-4">
            Centro de Conhecimento KAIROS
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Artigos, guias e novidades sobre o universo KAIROS e IA avançada.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="text-center text-slate-500 text-lg">Nenhum artigo publicado ainda. Volte em breve!</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const IconToRender = post.icon || BookOpenIcon; // Fallback icon
              return (
              <article
                key={post.id}
                className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col border-2 border-slate-700/50 hover:border-sky-500/70 transition-all duration-300 ease-in-out transform hover:scale-[1.02] group"
              >
                {post.icon && (
                  <div className={`h-48 w-full overflow-hidden bg-slate-700 flex items-center justify-center group-hover:bg-slate-600 transition-colors`}>
                    <IconToRender className={`w-24 h-24 ${post.iconColor || 'text-sky-400'} opacity-50 group-hover:opacity-75 transition-opacity`} />
                  </div>
                )}
                {/* Fallback if no icon but imageUrl exists (though prompt intends to remove imageUrls) */}
                {/* {!post.icon && post.imageUrl && (
                  <div className="h-48 w-full overflow-hidden bg-slate-700">
                    <img src={post.imageUrl} alt={`Imagem para ${post.title}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                )} */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-sky-400 mb-2 hover:text-sky-300 transition-colors">
                    <button onClick={() => onNavigate('blogPost', { slug: post.slug })} className="text-left focus:outline-none">
                      <IconToRender className={`w-5 h-5 mr-2 inline-block relative -top-0.5 ${post.iconColor || 'text-sky-400'}`} /> {post.title}
                    </button>
                  </h3>
                  <div className="flex items-center text-xs text-slate-500 mb-3 space-x-3">
                    <span className="flex items-center"><UserCircleIcon className="w-4 h-4 mr-1.5 text-slate-400" />{post.author}</span>
                    <span className="flex items-center"><CalendarDaysIcon className="w-4 h-4 mr-1.5 text-slate-400" />{formatDate(post.date)}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4 flex-grow">
                    {post.summary}
                  </p>
                  {post.category && (
                    <div className="text-xs text-slate-400 mb-3">
                      <span className="inline-flex items-center bg-slate-700 px-2 py-0.5 rounded-full">
                        <TagIcon className="w-3 h-3 mr-1 text-fuchsia-400"/> {post.category}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => onNavigate('blogPost', { slug: post.slug })}
                    className="mt-auto self-start inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 group"
                    aria-label={`Ler Artigo ${post.title}`}
                  >
                    Ler Artigo <ArrowRightIcon className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogListPage;
