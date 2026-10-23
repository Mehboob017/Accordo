export const headerMenu = [
  {
    id: 1,
    title: 'Home',
    // styleType: 'link',
    customClass: 'nav-item',
    path: '/',
  },
  {
    id: 2,
    title: 'About Us',
    customClass: 'nav-item dropdown',
    customChildren: false,
    children: [
      { title: 'Company Profile', type: 'link', path: '/about-us/company-profile' },
      { title: 'SDL Legacy', type: 'link', path: '/about-us/sdl-legacy' },
      { title: 'Leadership', type: 'link', path: '/about-us/leadership' },
      { title: 'Associations & Initiatives', type: 'link', path: '/about-us/associations-and-initiatives' },
      { title: 'Quality & Excellence', type: 'link', path: '/about-us/quality-and-excellence' },
    ],
  }
];
