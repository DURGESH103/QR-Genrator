import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

const EMOJI_CATEGORIES = {
  'Smileys': ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕'],
  'Hearts': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'],
  'Animals': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔'],
  'Food': ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥮','🍢','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🧃','🥤','🧋','☕','🍵','🫖','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾'],
  'Travel': ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🛺','🚲','🛴','🛹','🛼','🚏','🛣️','🛤️','⛽','🚨','🚥','🚦','🛑','🚧','⚓','🛟','⛵','🚤','🛥️','🛳️','⛴️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸','🪐','🌍','🌎','🌏','🗺️','🧭','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🧱','🪨','🪵','🛖','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋'],
  'Objects': ['⌚','📱','💻','⌨️','🖥️','🖨️','🖱️','🖲️','💽','💾','💿','📀','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💰','💴','💵','💶','💷','💸','💳','🪙','💹','📈','📉','📊','📋','📌','📍','📎','🖇️','📏','📐','✂️','🗃️','🗄️','🗑️','🔒','🔓','🔏','🔐','🔑','🗝️','🔨','🪓','⛏️','⚒️','🛠️','🗡️','⚔️','🔫','🪃','🏹','🛡️','🪚','🔧','🪛','🔩','⚙️','🗜️','⚖️','🦯','🔗','⛓️','🪝','🧲','🪜','⚗️','🧪','🧫','🧬','🔭','🔬','🩺','💊','🩹','🩼','🩻','🩸','🧬','🦠','🧫','🧪'],
};

const ALL_EMOJIS = [...new Set(Object.values(EMOJI_CATEGORIES).flat())];

// selected: array of emojis; onToggle(emoji) adds/removes one; onClear() empties the selection
const EmojiPicker = ({ selected = [], onToggle, onClear, max = 20 }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Smileys');

  const filtered = useMemo(() => {
    if (!search) return [...new Set(EMOJI_CATEGORIES[activeCategory] || [])];
    return ALL_EMOJIS.filter(e => e.includes(search)).slice(0, 60);
  }, [search, activeCategory]);

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-600">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search emoji..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-600 scrollbar-hide">
          {Object.keys(EMOJI_CATEGORIES).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div className="p-3 grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
        {filtered.map((emoji) => {
          const isSelected = selected.includes(emoji);
          const atLimit = !isSelected && selected.length >= max;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onToggle(emoji)}
              disabled={atLimit}
              aria-pressed={isSelected}
              className={`text-xl p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors leading-none disabled:opacity-40 disabled:cursor-not-allowed ${
                isSelected ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-400' : ''
              }`}
              title={emoji}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      {/* Selected display */}
      {selected.length > 0 && (
        <div className="px-3 pb-3 flex items-center space-x-2 border-t border-gray-200 dark:border-gray-600 pt-3">
          <span className="text-2xl break-all">{selected.join('')}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{selected.length}/{max}</span>
          <button
            type="button"
            onClick={onClear}
            className="ml-auto flex-shrink-0 text-xs text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
