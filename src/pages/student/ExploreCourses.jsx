import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StudentSidebar from '../../components/layout/StudentSidebar';
import CourseCard from '../../components/shared/CourseCard';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import { ACCENT, ACCENT2, TEAL, STEEL, CREAM, SAND, GOLD, DANGER, NAVY2 } from '../../theme';

const SIDEBAR_W = 248;
const categories = ['All', 'AIML', 'Cloud', 'DataScience', 'Cybersecurity'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const sortOptions = ['Most Popular', 'Highest Rated', 'Newest'];

const catColors = {
  AIML: { bg: 'rgba(108,127,216,0.15)', color: ACCENT2, border: 'rgba(108,127,216,0.3)' },
  Cloud: { bg: 'rgba(78,205,196,0.15)', color: TEAL, border: 'rgba(78,205,196,0.3)' },
  DataScience: { bg: 'rgba(212,168,67,0.15)', color: GOLD, border: 'rgba(212,168,67,0.3)' },
  Cybersecurity: { bg: 'rgba(231,76,111,0.15)', color: DANGER, border: 'rgba(231,76,111,0.3)' },
};

export default function ExploreCourses() {
  const { user } = useAuth();
  const { db } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [sort, setSort] = useState('Most Popular');

  const filtered = useMemo(() => {
    let courses = [...db.courses];
    if (search) {
      const q = search.toLowerCase();
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q)) ||
        c.instructorName.toLowerCase().includes(q)
      );
    }
    if (category !== 'All') courses = courses.filter(c => c.category === category);
    if (level !== 'All') courses = courses.filter(c => c.level === level);
    if (sort === 'Most Popular') courses.sort((a, b) => b.enrolledCount - a.enrolledCount);
    else if (sort === 'Highest Rated') courses.sort((a, b) => b.rating - a.rating);
    return courses;
  }, [db.courses, search, category, level, sort]);

  const recommended = db.courses.filter(c =>
    (user?.interests || []).includes(c.category) && !user?.enrolledCourses?.includes(c.id)
  );

  const activeFilters = (category !== 'All' || level !== 'All');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <StudentSidebar />
      <Box sx={{ ml: { md: `${SIDEBAR_W}px` }, flex: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 7, md: 4 } }}>
        {/* Header */}
        <Box className="anim-fadeInUp" sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: CREAM, mb: 0.5, fontSize: { xs: '1.6rem', md: '2rem' } }}>Explore Courses</Typography>
          <Typography sx={{ color: STEEL, fontSize: '0.9rem' }}>
            {filtered.length} course{filtered.length !== 1 ? 's' : ''} found{search && ` for "${search}"`}
          </Typography>
        </Box>

        {/* Search + Filters */}
        <Paper className="anim-fadeInUp delay-1" elevation={0} sx={{
          background: 'rgba(22,27,39,0.8)', border: '1px solid rgba(139,155,180,0.1)',
          borderRadius: 3.5, p: { xs: 2, sm: 3 }, mb: 4,
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField fullWidth placeholder="Search courses, topics, instructors..."
                value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: STEEL, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <Chip label="Clear" size="small" onClick={() => setSearch('')}
                        sx={{ background: 'rgba(139,155,180,0.1)', color: STEEL, cursor: 'pointer', fontSize: '0.7rem', height: 22 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: STEEL, fontSize: '0.85rem' }}>Category</InputLabel>
                <Select value={category} label="Category" onChange={e => setCategory(e.target.value)}
                  sx={{ borderRadius: 2.5, color: CREAM, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139,155,180,0.2)' } }}>
                  {categories.map(c => <MenuItem key={c} value={c}>{c === 'All' ? 'All Categories' : c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: STEEL, fontSize: '0.85rem' }}>Level</InputLabel>
                <Select value={level} label="Level" onChange={e => setLevel(e.target.value)}
                  sx={{ borderRadius: 2.5, color: CREAM, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139,155,180,0.2)' } }}>
                  {levels.map(l => <MenuItem key={l} value={l}>{l === 'All' ? 'All Levels' : l}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: STEEL, fontSize: '0.85rem' }}>Sort</InputLabel>
                <Select value={sort} label="Sort" onChange={e => setSort(e.target.value)}
                  sx={{ borderRadius: 2.5, color: CREAM, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139,155,180,0.2)' } }}>
                  {sortOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Active filter chips */}
          {activeFilters && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FilterListRoundedIcon sx={{ color: STEEL, fontSize: 16 }} />
              {category !== 'All' && (
                <Chip label={category} size="small" onDelete={() => setCategory('All')}
                  sx={{ background: catColors[category]?.bg, color: catColors[category]?.color, border: `1px solid ${catColors[category]?.border}`, fontSize: '0.7rem' }} />
              )}
              {level !== 'All' && (
                <Chip label={level} size="small" onDelete={() => setLevel('All')}
                  sx={{ background: 'rgba(212,168,67,0.15)', color: GOLD, border: '1px solid rgba(212,168,67,0.3)', fontSize: '0.7rem' }} />
              )}
              <Chip label="Clear all" size="small" variant="outlined" onClick={() => { setCategory('All'); setLevel('All'); setSearch(''); }}
                sx={{ color: STEEL, borderColor: 'rgba(139,155,180,0.2)', fontSize: '0.7rem' }} />
            </Box>
          )}
        </Paper>

        {/* Recommended */}
        {!search && category === 'All' && recommended.length > 0 && (
          <Box className="anim-fadeInUp delay-2" sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM, mb: 2.5 }}>⚡ Based on Your Interests</Typography>
            <Grid container spacing={2.5}>
              {recommended.slice(0, 3).map(course => (
                <Grid item xs={12} sm={6} lg={4} key={course.id}>
                  <CourseCard course={course} enrolled={user?.enrolledCourses?.includes(course.id)} favorited={user?.favoriteCourses?.includes(course.id)} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* All courses */}
        <Box className="anim-fadeInUp delay-3">
          <Typography variant="h6" sx={{ fontWeight: 700, color: CREAM, mb: 2.5 }}>
            {search ? 'Search Results' : category !== 'All' ? `${category} Courses` : 'All Courses'}
          </Typography>

          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography sx={{ fontSize: '3rem', mb: 2 }}>🔍</Typography>
              <Typography variant="h6" sx={{ color: CREAM, mb: 1 }}>No courses found</Typography>
              <Typography sx={{ color: STEEL, fontSize: '0.9rem' }}>Try adjusting your search or filters</Typography>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {filtered.map(course => (
                <Grid item xs={12} sm={6} lg={4} key={course.id}>
                  <CourseCard course={course} enrolled={user?.enrolledCourses?.includes(course.id)} favorited={user?.favoriteCourses?.includes(course.id)} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
}