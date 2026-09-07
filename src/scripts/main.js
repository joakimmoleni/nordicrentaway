import {enhanceNavigation} from './navigation.js';
import {enhanceGalleries} from './gallery.js';
import {enhanceMedia} from './media.js';

// HTML and native controls remain usable when any enhancement is unavailable.
enhanceNavigation();
enhanceGalleries();
enhanceMedia();
