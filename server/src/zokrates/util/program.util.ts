export const hashingProgram =
  'import "hashes/sha256/512bitPacked" as sha256packed; \n \
\n \
def main(private field a, private field b, private field c, private field d) -> field[2] { \n \
    field[2] h = sha256packed([a, b, c, d]); \n \
    return h; \n \
}';

export const splitJoinProgram =
  'import "hashes/sha256/512bitPacked" as sha256packed; \n \
\n \
def main( \
  field hashfulla, \
  field hashfullb, \
  field hashpartial0a, \
  field hashpartial0b, \
  field hashpartial1a, \
  field hashpartial1b, \
  private field saltfull, \
  private field saltpartial0, \
  private field saltpartial1, \
  private field balancefull, \
  private field balancepartial0, \
  private field balancepartial1) { \n \
    field[2] h = sha256packed([0, saltfull, 0, balancefull]); \n \
    assert(h[0] == hashfulla); \n \
    assert(h[1] == hashfullb); \n \
    \n \
    field[2] h0 = sha256packed([0, saltpartial0, 0, balancepartial0]); \n \
    assert(h0[0] == hashpartial0a); \n \
    assert(h0[1] == hashpartial0b); \n \
    \n \
    field[2] h1 = sha256packed([0, saltpartial1, 0, balancepartial1]); \n \
    assert(h1[0] == hashpartial1a); \n \
    assert(h1[1] == hashpartial1b); \n \
    \n \
    assert(balancefull > 0); \n \
    assert(balancepartial0 > 0); \n \
    assert(balancepartial1 > 0); \n \
    assert(balancefull == balancepartial0 + balancepartial1); \n \
    return; \n \
}';
