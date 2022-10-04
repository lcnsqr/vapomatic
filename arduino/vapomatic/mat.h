#ifndef MAT_h
#define MAT_h

#include <math.h>

namespace mat {
  int elem(int rows,int cols,int r,int c);

  // https://rosettacode.org/wiki/Matrix_multiplication#C
  void mult(const int m, const int n, const int p, double * const a, double * const b, double * const c);

  /*----------------------------------------------------------------------
  gjinv - Invert a matrix, Gauss-Jordan algorithm
  A is destroyed.  Returns 1 for a singular matrix.
  https://rosettacode.org/wiki/Gauss-Jordan_matrix_inversion#C

  ___Name_____Type______In/Out____Description_____________________________
     a[n*n]   double*   In        An N by N matrix
     n        int       In        Order of matrix
     b[n*n]   double*   Out       Inverse of A
  ----------------------------------------------------------------------*/
  int inv(const int n, double *a, double *b);
}

#endif