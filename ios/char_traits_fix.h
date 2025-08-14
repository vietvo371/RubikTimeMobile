#ifndef CHAR_TRAITS_FIX_H
#define CHAR_TRAITS_FIX_H

#include <string>

namespace std {
    template<>
    struct char_traits<unsigned char> {
        typedef unsigned char char_type;
        typedef int int_type;
        typedef streamoff off_type;
        typedef streampos pos_type;
        typedef mbstate_t state_type;

        static void assign(char_type& c1, const char_type& c2) noexcept {
            c1 = c2;
        }

        static bool eq(const char_type& c1, const char_type& c2) noexcept {
            return c1 == c2;
        }

        static bool lt(const char_type& c1, const char_type& c2) noexcept {
            return c1 < c2;
        }

        static int compare(const char_type* s1, const char_type* s2, size_t n) {
            return memcmp(s1, s2, n);
        }

        static size_t length(const char_type* s) {
            return strlen(reinterpret_cast<const char*>(s));
        }

        static const char_type* find(const char_type* s, size_t n, const char_type& a) {
            return reinterpret_cast<const char_type*>(memchr(s, a, n));
        }

        static char_type* move(char_type* s1, const char_type* s2, size_t n) {
            return reinterpret_cast<char_type*>(memmove(s1, s2, n));
        }

        static char_type* copy(char_type* s1, const char_type* s2, size_t n) {
            return reinterpret_cast<char_type*>(memcpy(s1, s2, n));
        }

        static char_type* assign(char_type* s, size_t n, char_type a) {
            return reinterpret_cast<char_type*>(memset(s, a, n));
        }

        static int_type not_eof(const int_type& c) noexcept {
            return eq_int_type(c, eof()) ? !eof() : c;
        }

        static char_type to_char_type(const int_type& c) noexcept {
            return static_cast<char_type>(c);
        }

        static int_type to_int_type(const char_type& c) noexcept {
            return static_cast<int_type>(c);
        }

        static bool eq_int_type(const int_type& c1, const int_type& c2) noexcept {
            return c1 == c2;
        }

        static int_type eof() noexcept {
            return static_cast<int_type>(-1);
        }
    };
}

#endif // CHAR_TRAITS_FIX_H