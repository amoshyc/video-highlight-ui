import argparse
from moviepy.editor import VideoFileClip, concatenate_videoclips

def clip(video_src, video_type, starts, ends):
    video = VideoFileClip(video_src)
    clips = [video.subclip(s, e) for s, e in zip(starts, ends)]
    result = concatenate_videoclips(clips)
    result_path = pathlib.Path(video_src).parent / 'clip.{}'.format(video_type)
    # result.write_videofile(str(result_path), threads=3)
    result.write_videofile(str(result_path))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('path', help="path/to/label/file")
    args = parser.parse_args()

    with open(args.path, 'r') as f:
        data = json.load(f.read())
    
    video_src = data['source']
    video_type = data['type']
    starts = data['starts']
    ends = data['ends']

    clip(video_src, video_type, starts, ends)

if __name__ == '__main__':
    main()