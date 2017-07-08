import argparse
import pathlib
import json
import sys
from moviepy.editor import VideoFileClip, concatenate_videoclips

def clip(video_src, video_type, starts, ends):
    video = VideoFileClip(video_src)
    clips = [video.subclip(s, e) for s, e in zip(starts, ends)]
    result = concatenate_videoclips(clips)
    result_path = pathlib.Path(video_src).parent / 'clip.{}'.format(video_type)
    result.write_videofile(str(result_path), threads=3)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('path', help="path/to/label/file")
    args = parser.parse_args()
    path = pathlib.Path(args.path).expanduser().absolute()

    with open(str(path), 'r') as f:
        data = json.loads(f.read()) # change

    video_src = data['video_src']
    video_type = data['video_type']
    starts = data['starts']
    ends = data['ends']

    clip(video_src, video_type, starts, ends)

if __name__ == '__main__':
    main()